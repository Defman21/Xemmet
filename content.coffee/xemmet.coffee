(->
  prefs    = require './extra/prefs'
  emmet    = require './sdk/emmet'
  beautify = require './sdk/beautify/beautify'
  snippets = require './extra/snippets'
  log      = require('ko/logging').getLogger 'xemmet'
  logLevel = require('ko/logging').LOG_INFO
  notify   = require 'notify/notify'
  {Cc, Ci} = require 'chrome'
  ko       = require('ko/windows').getMain().ko

  migrations = require './migrations/index'

  @logger = log
  koSnippet = no
  
  @baseLangs =
    html: [
      'html', 'html5', 'rhtml'
      'erb', 'markdown', 'php'
    ]
    css: [
      'css', 'scss', 'less'
      'sass'
    ]

  ignoreExpand =
    css: [/^\$/]

  beautifyConfig =
    indent_size: 1
    indent_char: '\t'
    unformatted: []

  subLangs =
    html: []
    css: []

  notified = no
  loaded = no
  inWrapMode = no
  selection = null

  @debug = {}
  @prefs = require 'ko/prefs'

  @_loadInjector = =>
    prefs.injectPref
      basename: 'pref-editsmart'
      siblingSelector: '#folding_groupbox'
      caption: 'Xemmet'
    log.debug 'Injected preferences'

  @_notify = (message, priority = 'info') =>
    notify.send message,
      priority
      category: 'xemmet'

  @_upgradeLanguages = =>
    customCssLangs  = @prefs.getString('xemmet.languages.css', '').split  " "
    customHtmlLangs = @prefs.getString('xemmet.languages.html', '').split " "

    subLangs.css = customCssLangs
    subLangs.html = customHtmlLangs

  @_loadSystemSnippets = (data) =>
    if data
      try
        emmet.loadSystemSnippets data
        log.debug 'Loaded system snippets'
      catch e
        log.exception e

  @_loadUserSnippets = =>
    file    = require 'ko/file'
    dirsSvc = Cc['@activestate.com/koDirs;1'].getService Ci.koIDirs
    path    = file.join dirsSvc.userDataDir, 'snippets.json'

    if file.exists path
      try
        emmet.loadSnippets JSON.parse file.read path
        log.debug 'Loaded user snippets'
      catch e
        unless notified
          @_notify 'Xemmet: unable to load your snippets', 'error'
          notified = yes
          log.exception e

  @__debug__ = (permanent = no) =>
    @prefs.setBoolean 'xemmet.debug', permanent
    log.setLevel require('ko/logging').LOG_DEBUG

  @load = =>
    return no unless @prefs.getBoolean 'xemmet.enabled', yes

    Promise.all(migrations.proceed @).then((result) =>
      if @prefs.getBoolean 'xemmet.debug', no
        log.setLevel require('ko/logging').LOG_DEBUG
      else
        log.setLevel logLevel

      for migration in result
        log.info "Migration #{migration.name} passed: #{JSON.stringify migration.result}"

      window.addEventListener 'keydown', @onKeyDownListener, yes
      window.addEventListener 'editor_view_opened', @onViewOpened, yes

      loaded = yes unless loaded

      @_loadInjector()
      require('notify/categories').register 'xemmet', label: 'Xemmet'
      @_upgradeLanguages()
      @_loadSystemSnippets snippets.snippets()
      @_loadUserSnippets()
      log.info 'Xemmet loaded'
    ).catch (error) =>
      log.error 'Xemmet failed to load'
      log.exception error

  @unload = =>
    window.removeEventListener 'keydown', @onKeyDownListener, yes
    window.removeEventListener 'editor_view_opened', @onViewOpened, yes
    loaded = no
    log.info 'Xemmet unloaded'

  @enable = =>
    return no if loaded
    @load()

  @disable = =>
    return no unless loaded
    @unload()

  @_createSnippet = (text, noIndent = no) =>
    # the whole function is ko.projects.addSnippetFromText except for:
    # * no % escaping
    # * no .addItem call
    unless koSnippet
      log.debug 'koSnippet has been defined'
      koSnippet = ko.toolbox2.createPartFromType 'snippet'
      koSnippet.type = 'snippet'
      koSnippet.setStringAttribute 'name', 'xemmet-temp-snippet'
      koSnippet.setStringAttribute 'set_selection', 'false'
      koSnippet.setStringAttribute 'auto_abbreviation', 'false'
    koSnippet.setStringAttribute 'indent_relative', '' + (not noIndent)
    ANCHOR_MARKER = '!@#_anchor'
    CURRENTPOS_MARKER = '!@#_currentPos'
    text = "#{ANCHOR_MARKER}#{text}#{CURRENTPOS_MARKER}"
    koSnippet.value = text
    koSnippet

  @_replace = (text, rules) =>
    for rule in rules
      text = text.replace rule.regex, rule.replace
    text

  @_prepare = (snippet, replaceWith = null) =>
    log.debug "@_prepare: args = #{JSON.stringify arguments}"

    rules = [
      {
        regex: /\|/gmi
        replace: replaceWith or '[[%tabstop:]]'
      }
      {
        regex: /(\$.*?\{[\t\s\n.]*?(\d+|\w+)(?:\:(.+?))?[\t\s\n.]*?\})/gmi
        replace: (_, g1, g2, g3) =>
          return replaceWith if replaceWith
          if isNaN g2
            g3 = g2
            g2 = ""
          g3 = "" if typeof(g3) is 'undefined'
          "[[%tabstop#{g2}:#{g3}]]"
      }
      {
        regex: /\{\s*\}/gmi,
        replace: replaceWith or '{[[%tabstop:]]}'
      }
    ]

    prepared = @_replace snippet, rules
    log.debug "@_prepare return = #{prepared}"
    prepared

  @_getBaseLang = (lang) =>
    return 'html' if lang in subLangs.html
    return 'css' if lang in subLangs.css
    lang

  @_isEnabledLang = (lang) =>
    return yes if lang in subLangs.html or lang in subLangs.css
    no

  @_beautify = (data) =>
    editor = require 'ko/editor'
    unless editor.scimoz().useTabs
      log.debug '@_beautify indent = spaces'
      beautifyConfig.indent_size = editor.scimoz().indent
      beautifyConfig.indent_char = " "
    else
      log.debug '@_beautify indent = tabs'
    beautify.html data, beautifyConfig

  @_expand = (string, language, beautify = yes) =>
    log.debug "@_expand args = #{JSON.stringify arguments}"
    try
      expand = emmet.expandAbbreviation string, language
      unless beautify
        log.debug "@_expand return = #{expand}"
        return expand
      if @_getBaseLang(language) is 'html'
        expand = @_beautify expand
      log.debug "@_expand return = #{expand}; beautified!"
      expand
    catch e
      log.debug "@_expand return = #{expand}; exception!"
      expand
  
  @_extractAbbr = (string) =>
    emmet.utils.action.extractAbbreviation string
  
  @_isAbbr = (string) =>
    log.debug "@_isAbbr args = #{JSON.stringify arguments}"
    
    try
      extract = @_extractAbbr string
      
      if extract.trim().length is 0
        log.debug '@_isAbbr abbreviation is invalid/empty'
        return success: no
      log.debug "@_isAbbr extract = #{extract}; success!"
      return success: yes, data: extract, length: extract.length
    catch e
      log.debug "@_isAbbr invalid abbreviation = #{extract}"
      log.debug e
      return success: no

  @_strip = (string) =>
    string.replace(/<(?:.|\n)*?>/gm, '')
  
  @_finalize = =>
    log.debug 'Current string is not a valid Emmet abbreviation, passing it to Komodo handlers'
    true
  
  @_createSelection = (abbrLength, editor) =>
    [start, end] = [editor.getCursorPosition(), editor.getCursorPosition()]
    start.ch -= abbrLength
    editor.setSelection start, end
    log.debug '@_createSelection created a selection'
  
  @_wrapSelection = (editor, language) =>
    wrapWith = editor.getLine().substring 0, editor.getCursorPosition().ch
    log.debug "@_wrapSelection wrapWith = #{wrapWith}"
    wrapWith = @_extractAbbr @_strip wrapWith
    log.debug "@_wrapSelection @_extractAbbr(wrapWith) = #{wrapWith}"
    
    @_createSelection wrapWith.length, editor
    
    abbreviation = @_isAbbr wrapWith
    
    if abbreviation.success
      expand = @_prepare @_expand(abbreviation.data, language, no), '[[replace]]'
      expand = expand.replace '[[replace]]', selection
      log.debug "@_wrapSelection to insert = #{expand}"
      try
        if @prefs.getBoolean 'xemmet.beautify', yes
          expand = @_beautify expand
      catch e
        log.debug 'unable to beautify the result'
      snippet = @_createSnippet expand, no
      ko.abbrev.insertAbbrevSnippet snippet, require('ko/views').current().get()
    else
      @_notify "Xemmet: abbreviation #{wrapWith} is invalid", 'error'
      return no
    yes
    
  @onViewOpened = =>
    @_upgradeLanguages()
    @_loadUserSnippets()
  
  @onKeyDownListener = (event) =>
    key = event.keyCode
    return yes if key not in [9, 27] # only proceed if esc/tab was pressed
    editor = require 'ko/editor'
    views  = require 'ko/views'
    koDoc = views.current().get 'koDoc'
    lang = koDoc.subLanguage
    return yes unless lang
    lang = lang.toLowerCase().replace ' ', '_'
    
    if key is 27 and inWrapMode # esc key
      @_notify 'Xemmet: Wrap Selection has been canceled'
      inWrapMode = no
      selection = ''
      return yes
    
    if key is 9 # tab key
      if event.shiftKey or koDoc.getTabstopInsertionTable({}).length > 0
        return yes
    
      if @prefs.getBoolean('xemmet.strict', yes) and not @_isEnabledLang lang
        log.debug "Prefs[global]: xemmet.strict = true, Xemmet ignores #{lang}"
        return yes

      if event.ctrlKey and not inWrapMode
        log.debug 'Listener[global] ctrl+tab'
        if @prefs.getBoolean('xemmet.strict.wrap', yes) and @_getBaseLang(lang) isnt 'html'
          @_notify 'Xemmet: Wrap Selection is in strict mode (HTML only)'
          e.preventDefault()
          return yes

        selection = editor.getSelection()
        message = 'Selection'

        if selection.length is 0 and @prefs.getBoolean 'xemmet.wrap_lines', yes
          selection = editor.getLine()
          message = 'Current line'
          editor.goLineEnd()
          @_createSelection selection.length, editor
        else if selection.length is 0
          log.debug 'Prefs[selection-grab]: xemmet.wrap_lines = false, selection = null; return'
          return yes

        event.preventDefault()
        inWrapMode = yes
        @_notify "Xemmet: #{message} has been saved, write your abbreviation"
        log.debug "Listener[selection-grab] selection = #{selection}"
        editor.replaceSelection ''
      else if inWrapMode
        inWrapMode = no
        event.preventDefault() if @_wrapSelection editor, lang
      else if editor.getSelection().length is 0
        log.debug 'Listener[global] tab'
        line = editor.getLine().substring 0, editor.getCursorPosition().ch
        log.debug "Listener[tab] string before caret '#{line}'"

        toExpand = @_strip line
        if typeof ignoreExpand[lang] isnt 'undefined'
          for regex in ignoreExpand[lang]
            @_finalize() if regex.test toExpand

        isSelection = no

        log.debug "Listener[tab-expand] possible abbreviation before caret '#{toExpand}'"

        abbreviation = @_isAbbr toExpand, lang

        if abbreviation.success
          log.debug 'Listener[tab-expand; success] inserting abbreviation'
          editor.scimoz().beginUndoAction()
          event.preventDefault()
          toInsert = abbreviation.data
          expand = @_prepare @_expand toInsert, lang, @prefs.getBoolean('xemmet.beautify', yes)
          len = abbreviation.length

          log.debug "Listener[tab-expand; success] to insert: #{expand} (from abbr #{toInsert}); len = #{len}"

          @_createSelection(len, editor) unless isSelection

          tempSnippet = @_createSnippet expand, no

          ko.abbrev.insertAbbrevSnippet tempSnippet, require('ko/views').current().get()
          editor.scimoz().endUndoAction()
      else
        return @_finalize()
  
).apply module.exports

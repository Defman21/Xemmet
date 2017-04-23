(->
  prefs    = require './extra/prefs'
  emmet    = require './sdk/emmet'
  beautify = require './sdk/beautify/beautify'
  snippets = require './extra/snippets'
  log      = require('ko/logging').getLogger 'xemmet'
  logLevel = require('ko/logging').LOG_DEBUG
  notify   = require 'notify/notify'
  {Cc, Ci} = require 'chrome'
  
  baseLangs =
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
      siblingSelector: '#highlightvariable_groupbox'
      caption: 'Xemmet'
    log.debug 'Injected preferences'

  @_upgradeLanguages = =>
    customCssLangs  = @prefs.getString('xemmet_css_languages', '').split  " "
    customHtmlLangs = @prefs.getString('xemmet_html_languages', '').split " "

    subLangs.css = customCssLangs
    subLangs.html = customHtmlLangs

  @_loadSystemSnippets = (data) =>
    if data
      try
        emmet.loadSystemSnippets data
        log.debug 'Loaded system snippets'
      catch e
        log.error e

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
          notify.send 'Xemmet: unable to load your snippets',
            priority: 'error'
            category: 'xemmet'
          notified = on
          log.warn e

  @__debug__ = =>
    log.setLevel require('ko/logging').LOG_DEBUG

  @load = =>
    return no unless @prefs.getBoolean 'xemmet_enabled', on

    try
      @prefs.getString 'xemmet_css_languages'
      @prefs.getString 'xemmet_html_languages'
    catch e
      log.debug 'First run'
      @prefs.setString 'xemmet_css_languages', baseLangs.css.join " "
      @prefs.setString 'xemmet_html_languages', baseLangs.html.join " "

    window.addEventListener 'keydown', @onKeyDownListener, on
    window.addEventListener 'editor_view_opened', @onViewOpened, on

    log.setLevel logLevel

    loaded = on unless loaded

    @_loadInjector()
    require('notify/categories').register 'xemmet', label: 'Xemmet'
    @_upgradeLanguages()
    @_loadSystemSnippets snippets.snippets()
    @_loadUserSnippets()
    log.debug 'Loaded'

  @unload = =>
    window.removeEventListener 'keydown', @onKeyDownListener, on
    window.removeEventListener 'editor_view_opened', @onViewOpened, on
    loaded = no
    log.debug 'Unloaded'

  @enable = =>
    return no if loaded
    @load()

  @disable = =>
    return no unless loaded
    @unload()

  @_createSnippet = (text, noIndent) =>
    type: 'snippet'
    name: 'xemmet-temp-snippet'
    parent:
      name: 'xemmet-parent'
    set_selection: no
    indent_relative: not noIndent
    value: text
    hasAttribute: (name) => name in @
    getStringAttribute: (name) => '' + @[name]

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
    return on if lang in subLangs.html or lang in subLangs.css
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

  @_expand = (string, language, noBeautify = no) =>
    log.debug "@_expand args = #{JSON.stringify arguments}"
    try
      expand = emmet.expandAbbreviation string, language
      log.debug "@_expand expand = #{expand}"
      if noBeautify
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
      return success: on, data: extract, length: extract.length
    catch e
      log.error "@_isAbbr invalid abbreviation = #{extract}"
      log.exception e
      return success: no

  @_strip = (string) =>
    string.replace(/<(?:.|\n)*?>/gm, '')
  
  @_finalize = =>
    log.info 'Current string is not a valid Emmet abbreviation, passing it to Komodo handlers'
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
      expand = @_prepare @_expand(abbreviation.data, language, on), '[[replace]]'
      expand = expand.replace '[[replace]]', selection
      log.debug "@_wrapSelection to insert = #{expand}"
      try
        expand = @_beautify expand
      catch e
        log.debug 'unable to beautify the result'
      snippet = @_createSnippet expand, no
      ko.abbrev.insertAbbrevSnippet snippet, require('ko/views').current().get()
    else
      notify.send "Xemmet: abbreviation #{wrapWith} is invalid",
        priority: 'error'
        category: 'xemmet'
      return no
    on
    
  @onViewOpened = =>
    @_upgradeLanguages()
    @_loadUserSnippets()
  
  @onKeyDownListener = (event) =>
    editor = require 'ko/editor'
    views  = require 'ko/views'
    koDoc = views.current().get 'koDoc'
    lang = koDoc.subLanguage
    return on if lang is no
    lang = lang.toLowerCase().replace ' ', '_'
    key = event.keyCode
    
    if key is 27 and inWrapMode # esc key
      notify.send 'Xemmet: Wrap Selection has been canceled',
        priority: 'info'
        category: 'xemmet'
      inWrapMode = no
      selection = ''
      return on
    
    if key is 9 # tab key
      if event.shiftKey or koDoc.getTabstopInsertionTable({}).length > 0
        return on
    
      if @prefs.getBoolean('xemmet_strict_mode', on) and not @_isEnabledLang lang
        log.debug "Prefs[global]: xemmet_strict_mode = true, Xemmet ignores #{lang}"
        return on

      if event.ctrlKey and not inWrapMode
        log.debug 'Listener[global] ctrl+tab'
        if @prefs.getBoolean('xemmet_wrap_strict_mode', on) and @_getBaseLang(lang) isnt 'html'
          notify.send 'Xemmet: Wrap Selection is in strict mode (HTML only)',
            priority: 'info'
            category: 'xemmet'
          e.preventDefault()
          return on

        selection = editor.getSelection()
        message = 'Selection'

        if selection.length is 0 and @prefs.getBoolean('xemmet_enable_line_wrap_selection', on)
          selection = editor.getLine()
          message = 'Current line'
          editor.goLineEnd()
          @_createSelection selection.length, editor
        else if selection.length is 0
          log.debug 'Prefs[selection-grab]: xemmet_enable_line_wrap_selection = false, selection = null; return'
          return on

        event.preventDefault()
        inWrapMode = on
        notify.send "Xemmet: #{message} has been saved, write your abbreviation",
          priority: 'info'
          category: 'xemmet'
        log.debug "Listener[selection-grab] selection = #{selection}"
        editor.replaceSelection ''
      else if inWrapMode
        inWrapMode = no
        event.preventDefault() if @_wrapSelection editor, lang
      else if editor.getSelection().length is 0
        log.debug 'Listener[global] tab'
        line = editor.getLine().substring 0, editor.getCursorPosition().ch
        log.debug "Listener[tab] string before caret '#{line}'"

        toEpxand = @_strip line
        if typeof ignoreExpand[lang] isnt 'undefined'
          for regex in ignoreExpand[lang]
            @_finalize() if regex.test toEpxand

        isSelection = no

        log.debug "Listener[tab-expand] possible abbreviation before caret '#{toEpxand}'"

        abbreviation = @_isAbbr toEpxand, lang

        if abbreviation.success
          log.debug 'Listener[tab-expand; success] inserting abbreviation'
          editor.scimoz().beginUndoAction()
          event.preventDefault()
          toInsert = abbreviation.data
          expand = @_prepare @_expand toInsert, lang
          len = abbreviation.length

          log.debug "Listener[tab-expand; success] to insert: #{expand} (from abbr #{toInsert}); len = #{len}"

          @_createSelection(len, editor) unless isSelection

          tempSnippet = @_createSnippet expand, no

          ko.abbrev.insertAbbrevSnippet tempSnippet, require('ko/views').current().get()
          editor.scimoz().endUndoAction()
      else
        return @_finalize()
  
).apply module.exports

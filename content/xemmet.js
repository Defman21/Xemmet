(function () {
    const _prefs = require('./extra/prefs');
    const emmet = require('./sdk/emmet');
    const beautify = require('./sdk/beautify/beautify');
    const snips = require('./extra/snippets');
    const log = require('ko/logging').getLogger('xemmet');
    const logLevel = require('ko/logging').LOG_DEBUG;
    const {Cc, Ci} = require("chrome");
    
    const baselangs = {
        html: ["html", "html5", "rhtml",
               "erb", "markdown", "php",
               "komodo_snippet"],
        css: ["css", "scss", "less"]
    };
    
    const ignoreExpand = {
        css: [/^\$/]
    };
    
    var beautify_config = {
        indent_size: 1,
        indent_char: "\t",
        unformatted: []
    };
    
    var notified = false;
    
    var sublangs = {html: [], css: []};
    
    var loaded = false;
    var inWrapMode = false;
    var selection = "";
    
    this.debug = {};
    this.prefs = {};
    
    (function() {
        var p = require('ko/prefs');
        
        this.setBool = (name, value) => p.setBoolean(name, value);
        this.setString = (name, value) => p.setString(name, value);
        this.setLong = (name, value) => p.setLong(name, value);
        
        this.getBool = (name, value) => p.getBoolean(name, value);
        this.getString = (name, value) => p.getString(name, value);
        this.getLong = (name, value) => p.getLong(name, value);
    }).apply(this.prefs);
    
    this._loadInjector = () =>
    {
        _prefs.injectPref({
            basename: "pref-editsmart",
            siblingSelector: "#highlightvariable_groupbox",
            caption: "Xemmet"
        });
        log.debug("Xemmet: injected a preference");
    };
        
    this._upgradeLanguages = () =>
    {
        var custom_html_langs = this.prefs.getString("xemmet_html_languages").split(" ");
        var custom_css_langs = this.prefs.getString("xemmet_css_languages").split(" ");
        sublangs.html = custom_html_langs;
        sublangs.css = custom_css_langs;
    };
    
    this._loadSystemSnippets = (data) =>
    {
        if (data) {
            try {
                emmet.loadSystemSnippets(data);
                log.debug("System snippets loaded");
            } catch (e) {
                log.error(e);
                return;
            }
        }
    };
    
    this._loadUserSnippets = () =>
    {
        var file = require("ko/file");
        var dirsSvc = Cc['@activestate.com/koDirs;1'].getService(Ci.koIDirs);
        var snippetsPath = file.join(dirsSvc.userDataDir, 'snippets.json');
        
        if (file.exists(snippetsPath)) {
            try {
                emmet.loadSnippets(JSON.parse(file.read(snippetsPath)));
                log.debug("User Snippets loaded");
            } catch (e) {
                if (!notified) {
                    require('notify/notify').send(`Xemmet: unable to load user snippets`, {
                        priority: "error",
                        category: "xemmet"
                    });
                    notified = true;
                }
                log.warn(e);
                return;
            }
        }
    };
    
    this.load = () =>
    {
        if (!this.prefs.getBool("xemmet_enabled", true)) return;
        try
        {
            this.prefs.getString('xemmet_css_languages');
            this.prefs.getString('xemmet_html_languages');
        } catch (e) // first run
        {
            this.prefs.setString("xemmet_css_languages",
                                 baselangs.css.join(" "));
            this.prefs.setString("xemmet_html_languages",
                                 baselangs.html.join(" "));
        }
        window.addEventListener('keydown', this.onKeyDownListener, true);
        window.addEventListener('editor_view_opened', this.onViewOpened, true);
        log.setLevel(logLevel);
        if (!loaded)
        {
            loaded = true;
        }
        this._loadInjector();
        require('notify/categories').register('xemmet', {label: "Xemmet"});
        this._upgradeLanguages();
        this._loadSystemSnippets(snips.snippets());
        this._loadUserSnippets();
        log.info("Xemmet loaded");
    };
    
    this.unload = () =>
    {
        window.removeEventListener('keydown', this.onKeyDownListener, true);
        window.removeEventListener('editor_view_opened', this.onViewOpened, true);
        loaded = false;
        snips.unload();
        log.info("Xemmet unloaded");
    };
    
    this.disable = () =>
    {
        if (!loaded) return false;
        this.unload(true);
        log.info("Xemmet disabled");
        loaded = false;
        return true;
    };
    
    this.enable = () =>
    {
        if (loaded) return false;
        this.load(true);
        log.info("Xemmet enabled");
        loaded = false;
        return true;
    };
    
    this._createSnippet = (text, noIndent) =>
    {
        return {
            type: 'snippet',
            name: 'xemmet-snippet',
            parent: {name: 'xemmet-parent'},
            set_selection: false,
            indent_relative: !noIndent,
            value: text,
            hasAttribute: function(name) { return (name in this); },
            getStringAttribute: function(name) { return ('' + this[name]); }
        };
    };
    
    this._replace = (text, search, block) =>
    {
        var prepared = text.replace(search, block);
        return prepared;
    };
    
    this._prepare = (snippet, custom) =>
    {
        log.debug("_prepare < " + JSON.stringify(arguments));
        var i = 0;
        var cr = false;
        if (typeof(custom) != "undefined")
        {
            cr = true;
        }
        var prepared = this._replace(snippet,
                                     /\|/gmi,
                                     () => {
                                        if (cr) return custom;
                                        return "[[%tabstop:]]";
                                     });
        prepared = this._replace(prepared,
                                 /(\$\{(\d+|\w+)(?:\:(.+?))?\})/gmi,
                                 (_, g1, g2, g3) => {
                                    if (cr) return custom;
                                    if (isNaN(g2)) {
                                        g3 = g2;
                                        g2 = "";
                                    }
                                    if (typeof(g3) == "undefined") g3 = "";
                                    return `[[%tabstop${g2}:${g3}]]`;
                                 });
        prepared = this._replace(prepared,
                                 /\{\s*\}/gmi,
                                 () => {
                                    if (cr) return custom;
                                    i++;
                                    return `{[[%tabstop${i}:]]}`;
                                 });
        log.debug(`_prepare > ${prepared}`);
        return prepared;
    };
    
    this._getBaseLang = (language) =>
    {
        if (sublangs.html.indexOf(language) > -1) return "html";
        if (sublangs.css.indexOf(language) > -1) return "css";
        return language;
    };
    
    this._getLang = (language) =>
    {
        return language;
    };
    
    this._isEnabledLang = (lang) =>
    {
        if (sublangs.html.indexOf(lang) > -1 ||
            sublangs.css.indexOf(lang) > -1) return true;
        return false;
    };
    
    this._beautify = (str) =>
    {
        var editor = require('ko/editor');
        if (!editor.scimoz().useTabs) {
            beautify_config.indent_size = require('ko/editor').scimoz().indent;
            beautify_config.indent_char = " ";
        }
        return beautify.html(str, beautify_config);
    };
    
    this._expand = (string, lang, no_beautify) =>
    {
        log.debug(`_expand < ${JSON.stringify(arguments)}`);
        var expand;
        try
        {
            expand = emmet.expandAbbreviation(string, lang);
            if (typeof(no_beautify) != "undefined" && no_beautify)
            {
                return expand;    
            }
            if (this._getBaseLang(lang) == "html")
            {
                expand = this._beautify(expand);
            }
            return expand;
        } catch (e)
        {
            return string;
        }
    };
    
    this._extractAbbr = (string) =>
    {
        return emmet.utils.action.extractAbbreviation(string);
    };
    
    this._isAbbr = (expandable) =>
    {
        log.debug("_isAbbr < " + JSON.stringify(arguments));
        try
        {
            var expand = this._extractAbbr(expandable);
            
            if (expand.trim().length === 0)
            {
                log.debug(`_isAbbr: Emmet abbreviation is empty (invalid)`);
                return {
                    success: false
                };
            }
            log.debug(`_isAbbr: expand = ${expand}`);
            return {
                success: true,
                data: expand,
                length: expand.length
            };
        } catch (e)
        {
            log.error(`_isAbbr: Invalid abbreviation: ${expand}`);
            log.exception(e);
            return {
                success: false
            };
        }
    };
    
    this._strip = (html) => {
        return html.replace(/<(?:.|\n)*?>/gm, '');
    };
    
    this._finalize = () =>
    {
        log.info("Current string is not a valid Emmet abbreviation, pass it to Komodo handlers");
        return true;
    };
    
    this._wrapSelection = (editor, lang) =>
    {
        var wrap_with = editor
                        .getLine()
                        .replace(/\t/gm, " ".repeat(editor.scimoz().tabWidth)) // https://github.com/Komodo/KomodoEdit/issues/2123
                        .substring(0, editor.getCursorPosition().ch);
        wrap_with = this._extractAbbr(this._strip(wrap_with));
        var posStart = editor.getCursorPosition();
        posStart.absolute -= wrap_with.length;
        var posEnd = editor.getCursorPosition();
        
        log.debug(JSON.stringify(posStart));
        log.debug(JSON.stringify(posEnd));
        
        editor.scimoz().setSel(posStart.absolute, posEnd.absolute);
        
        var abbreviation = this._isAbbr(wrap_with);
        if (abbreviation.success)
        {
            var expand = this._prepare(this._expand(abbreviation.data, lang, true), "[[replace]]");
            log.debug("_wrapSelection: to insert: " + expand);
            expand = expand.replace("[[replace]]", selection);
            try
            {
                expand = this._beautify(expand);
            } catch (e)
            {
                require('notify/notify').send("Xemmet: Unable to beautify the result!", {
                    priority: "warn",
                    category: "xemmet"
                });
            }
            var snippet = this._createSnippet(expand, false);
            ko.abbrev.insertAbbrevSnippet(snippet,
                                          require('ko/views').current().get());
        } else
        {
            require('notify/notify').send(`Xemmet: Abbreviation "${wrap_with}" is invalid`, {
                priority: "error",
                category: "xemmet"
            });
            return false;
        }
        return true;
    };
    
    this.onViewOpened = () =>
    {
        this._upgradeLanguages();
        this._loadUserSnippets();
    };
    
    this.onKeyDownListener = (e) =>
    {
        var _lang;
        var editor = require('ko/editor');
        var views = require('ko/views');
        if ((_lang = views.current().get('language')) === false) return true;
        _lang = _lang.toLowerCase().replace(" ", "_");
        var koDoc = views.current().get('koDoc');
        var lang = this._getLang(_lang);
        
        if (e.keyCode === 27 && inWrapMode)
        { // esc key
            require('notify/notify').send("Xemmet: Wrap Selection canceled", {
                priority: "info",
                category: "xemmet"
            });
            inWrapMode = false;
            selection = "";
            return true;
        }
        
        if (e.keyCode === 9)
        { // tab key
            if (e.shiftKey || koDoc.getTabstopInsertionTable({}).length > 0)
            {
                return true; // Komodo/KomodoEdit/issues/{1774,1777}
            }
            
            if (this.prefs.getBool("xemmet_strict_mode", true) &&
                !this._isEnabledLang(_lang))
            {
                log.debug("Strict mode enabled, Xemmet is ignoring current language");
                return true;
            }
            
            if (e.ctrlKey && !inWrapMode)
            {
                log.debug("Listener: processing Ctrl+tab press...");
                if (this.prefs.getBool("xemmet_wrap_strict_mode", true) &&
                    this._getBaseLang(lang) != "html")
                {
                    require('notify/notify').send("Xemmet: Wrap Selection works only in HTML", {
                        priority: "info",
                        category: "xemmet"
                    });
                    e.preventDefault();
                    return true;
                }
                
                e.preventDefault();
                
                inWrapMode = true;
                selection = editor.getSelection();
                var message = "Selection";
                if (selection.length === 0) {
                    selection = editor
                                .getLine();
                    message = "Current line";
                    var pos = editor.getCursorPosition();
                    pos.absolute -= selection.length;
                    editor.scimoz().setSel(pos.absolute, editor.getCursorPosition().absolute);
                }
                
                require('notify/notify').send(`Xemmet: ${message} has been saved, type your abbreviation`, {
                    priority: "info",
                    category: "xemmet"
                });
                log.debug("Selection: " + selection);
                editor.replaceSelection("");
            } else if (inWrapMode)
            {
                inWrapMode = false;
                if (this._wrapSelection(editor, lang))
                {
                    e.preventDefault();
                }
                
            } else if (editor.getSelection().length === 0)
            {
                log.debug('Listener: Processing tab press...');
                var toExpand, isSelection, line;
                line = editor
                        .getLine()
                        .replace(/\t/gm, " ".repeat(editor.scimoz().tabWidth)) // https://github.com/Komodo/KomodoEdit/issues/2123
                        .substring(0, editor.getCursorPosition().ch);
                toExpand = this._strip(line);
                if (typeof ignoreExpand[lang] !== 'undefined') {
                    for (let regex of ignoreExpand[lang]) {
                        if (regex.test(toExpand)) return this._finalize();
                    }
                }
                isSelection = false;
                
                log.debug(`Listener: string before caret: ${toExpand}`);
                var abbreviation = this._isAbbr(toExpand, lang);
                log.debug(JSON.stringify(abbreviation));
                
                if (abbreviation.success)
                {
                    log.debug("Listener: inserting abbreviation");
                    editor.scimoz().beginUndoAction();
                    var toInsert, expand, len;
                    e.preventDefault();
                    toInsert = abbreviation.data;
                    expand = this._expand(toInsert, lang);
                    expand = this._prepare(expand);
                    
                    len = abbreviation.length;
                    
                    log.debug(`> ${expand}; ${len}`);
                    
                    if (!isSelection)
                    {
                        var posStart = editor.getCursorPosition();
                        posStart.absolute -= len;
                        var posEnd = editor.getCursorPosition();
                        
                        log.debug(JSON.stringify(posStart));
                        log.debug(JSON.stringify(posEnd));
                        
                        editor.scimoz().setSel(posStart.absolute, posEnd.absolute);
                    }
                    
                    var tempSnippet = this._createSnippet(expand, false);
                    
                    ko.abbrev.insertAbbrevSnippet(tempSnippet,
                                                  require('ko/views').current().get());
                    editor.scimoz().endUndoAction();
                } else {
                    return this._finalize();
                }
            }
        }
    };
}).apply(module.exports);

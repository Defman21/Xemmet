(function () {
    const _prefs = require('./extra/prefs');
    const emmet = require('./sdk/emmet');
    const beautify = require('./sdk/beautify/beautify');
    const snips = require('./extra/snippets');
    const log = require('ko/logging').getLogger('xemmet');
    const logLevel = require('ko/logging').LOG_INFO;
    const baselangs = {
        html: ["html", "html5", "rhtml",
               "erb", "html.erb", "html.md",
               "markdown", "php"],
        css: ["css", "scss", "less"]
    };
    const beautify_config = {
        indent_size: 1,
        indent_char: "\t"
    };
    
    var sublangs = {html: [], css: []};
    
    var loaded = false;
    var inWrapMode = false;
    var selection = "";
    
    this.debug = {};
    this.prefs = {};
    
    this.getProperty = (property) => this[property];
    
    this.getEmmet = () => emmet;
    this.getLogger = () => log;
    this.getSnippets = () => snips;
    this.getSubLanguages = () => sublangs;
    
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
    
    this.load = (silent) =>
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
        snips.load();
        this._upgradeLanguages();
        if (typeof(silent) != "undefined" && silent) return;
        log.info("Xemmet loaded");
    };
    
    this.unload = (silent) =>
    {
        window.removeEventListener('keydown', this.onKeyDownListener, true);
        window.removeEventListener('editor_view_opened', this.onViewOpened, true);
        loaded = false;
        snips.unload();
        if (typeof(silent) != "undefined" && silent) return;
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
    
    this._prepare = (snippet, lang, custom) =>
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
    
    this._getLang = (language) =>
    {
        if (sublangs.html.indexOf(language) > -1) return "html";
        if (sublangs.css.indexOf(language) > -1) return "css";
        return language;
    };
    
    this._isEnabledLang = (lang) =>
    {
        if (sublangs.html.indexOf(lang) > -1 ||
            sublangs.css.indexOf(lang) > -1) return true;
        return false;
    };
    
    this._getSnippet = (language, text) =>
    {
        return snips.getSnippet(language, text);
    };
    
    this._expand = (string, lang, no_beautify) =>
    {
        var expand;
        try
        {
            expand = emmet.expandAbbreviation(string, lang);
            if (typeof(no_beautify) != "undefined" && no_beautify)
            {
                return expand;    
            }
            if (lang == "html")
            {
                expand = beautify.html(expand, beautify_config);
            }
            return expand;
        } catch (e)
        {
            return string;
        }
    };
    
    this._isAbbr = (expandable, lang) =>
    {
        log.debug("_isAbbr < " + JSON.stringify(arguments));
        if (this.prefs.getBool("xemmet_prioritize_snippets", false) === true &&
            ko.abbrev._checkPossibleAbbreviation(expandable))
        {
            log.info(`_isAbbr: there's a snippet for ${expandable}, canceling Xemmet handle..`);
            return [false, ""];
        }
        try
        {
            var expand;
            var object = this._getSnippet(lang, expandable);
            if (object.snippet === false)
            {
                expand = emmet.expandAbbreviation(expandable, lang);
            } else
            {
                log.debug(`_isAbbr: expandable is a snippet, ignore..`);
                require('notify/notify')
                .send(`Xemmet: snippet "${object.name}" inserted`,
                      {priority: "info",
                      category: "xemmet"
                });
                log.debug(JSON.stringify(object));
                return {
                    success: true,
                    abbrev: object.user,
                    data: object.data
                };
            }
            
            if (expand.trim().length === 0)
            {
                log.debug(`_isAbbr: Emmet abbreviation is empty (invalid)`);
                return {
                    success: false
                };
            }
            log.debug(`_isAbbr: expand = ${expand}; object = ${JSON.stringify(object)}`);
            if (lang == "css") expandable = expand;
            return {
                success: true,
                abbrev: false,
                data: expandable
            };
        } catch (e)
        {
            log.error(`_isAbbr: Invalid abbreviation: ${toExpand}`);
            return {
                success: false
            };
        }
    };
    
    this._finalize = () =>
    {
        log.info("Current string is not a valid Emmet abbreviation, pass it to Komodo handlers");
        return true;
    };
    
    this._wrapSelection = (editor) =>
    {
        var lang = "html";
        var wrap_with = editor.getLine().replace(/\t|\s{2,}/gm, "");
        
        var posStart = editor.getCursorPosition();
        posStart.ch -= wrap_with.length;
        var posEnd = editor.getCursorPosition();
        
        if (wrap_with.indexOf("{}") == -1)
        {
            wrap_with += "{}"; // add placeholder
        }
        
        editor.setSelection(
            posStart,
            posEnd
        );
        
        var abbreviation = this._isAbbr(wrap_with, lang);
        if (abbreviation.success && !abbreviation.snippet)
        {
            var insert = this._prepare(abbreviation.data,
                                       lang,
                                       "{[[replace]]}");
            var expand = this._expand(insert, lang, true);
            log.debug("_wrapSelection: to insert: " + expand);
            expand = expand.replace("[[replace]]", selection);
            try
            {
                expand = beautify.html(expand, beautify_config);
            } catch (e)
            {
                require('notify/notify').send("Xemmet: Unable to beautify the result!", {
                    priority: "warn",
                    category: "xemmet"
                });
            }
            var snippet = this._createSnippet(expand, false);
            editor.replaceSelection("");
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
    };
    
    this.onKeyDownListener = (e) =>
    {
        var editor = require('ko/editor');
        var views = require('ko/views');
        var _lang = views.current().get('language').toLowerCase();
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
            if (this.prefs.getBool("xemmet_strict_mode", true) &&
                !this._isEnabledLang(_lang))
            {
                log.debug("Strict mode enabled, Xemmet is ignoring current language");
                return true;
            }
            if (e.ctrlKey && !inWrapMode)
            {
                log.debug("Listener: processing Ctrl+tab press...");
                if (editor.getSelection().trim().length > 0)
                {
                    if (this.prefs.getBool("xemmet_wrap_strict_mode", true) &&
                        lang != "html")
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
                    
                    require('notify/notify').send("Xemmet: Your selection was saved, type your abbreviation", {
                        priority: "info",
                        category: "xemmet"
                    });
                    log.debug("Selection: " + selection);
                } else
                {
                    log.debug("Listener: no selection found or xemmet_wrap_strict_mode is enabled");
                    return true;
                }
            } else if (inWrapMode)
            {
                inWrapMode = false;
                if(this._wrapSelection(editor, lang))
                {
                    e.preventDefault();
                }
            } else
            {
                log.debug('Listener: Processing tab press...');
                var toExpand, isSelection;
                if (editor.getSelection().length === 0)
                {
                    toExpand = editor.getLine().replace(/\t|\s{2,}/gm, "");
                    isSelection = false;
                } else if (!koDoc.hasTabstopInsertionTable)
                {
                    toExpand = editor.getSelection();
                    isSelection = true;
                }
                
                log.debug(`Listener: string before caret: ${toExpand}`);
                var abbreviation = this._isAbbr(toExpand, lang);
                log.debug(JSON.stringify(abbreviation));
                if (abbreviation.success)
                {
                    var toInsert, expand;
                    e.preventDefault();
                    if (!abbreviation.abbrev)
                    {
                        toInsert = this._prepare(abbreviation.data, lang);
                        expand = this._expand(toInsert, lang);
                    }
                    
                    if (!isSelection)
                    {
                        var posStart = editor.getCursorPosition();
                        posStart.ch -= toExpand.length;
                        var posEnd = editor.getCursorPosition();
                        
                        editor.setSelection(
                            posStart,
                            posEnd
                        );
                        
                        editor.replaceSelection(""); // remove abbreviation
                    }
                    
                    if (abbreviation.abbrev) {
                        ko.abbrev.insertAbbrevSnippet(abbreviation.data,
                                                      require('ko/views').current().get());
                        return;
                    }
                    var tempSnippet = this._createSnippet(expand, false);
                    
                    ko.abbrev.insertAbbrevSnippet(tempSnippet,
                                                  require('ko/views').current().get());
                } else {
                    return this._finalize();
                }
            }
        }
    };
}).apply(module.exports);

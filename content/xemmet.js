(function () {
    const prefs = require('./extra/prefs');
    const emmet = require('./sdk/emmet');
    const beautify = require('./sdk/beautify/beautify');
    const snips = require('./extra/snippets');
    const log = require('ko/logging').getLogger('xemmet');    
    const sublangs = {
        html: ["html", "html5", "rhtml", "erb", "html.erb", "html.md"],
        css: ["css", "scss", "less"]
    };
    
    var loaded = false;
    
    this.debug = {};
    this.prefs = {};
    
    this.getProperty = (property) => this[property];
    
    this.getEmmet = () => emmet;
    this.getLogger = () => log;
    this.getSnippets = () => snips;
    this.getSubLanguages = () => sublangs;
    
    this.loadInjector = () => {
        prefs.injectPref({
            basename: "pref-editsmart",
            siblingSelector: "#collaboration_groupbox",
            prefname: "xemmet_snippets_are_important",
            caption: "Xemmet"
        });
        log.debug("Xemmet: injected a preference");
    };
    
    this.load = (silent) => {
        window.addEventListener('keydown', this.onKeyDownListener, true);
        log.setLevel(require('ko/logging').LOG_DEBUG);
        if (!loaded) {
            loaded = true;
        }
        this.loadInjector();
        require('notify/categories').register('xemmet', {label: "Xemmet"});
        snips.load();
        if (typeof(silent) != "undefined" && silent) return;
        log.info("Xemmet loaded");
    };
    
    this.unload = (silent) => {
        window.removeEventListener('keydown', this.onKeyDownListener, true);
        loaded = false;
        snips.unload();
        if (typeof(silent) != "undefined" && silent) return;
        log.info("Xemmet unloaded");
    };
    
    this.disable = () => {
        if (!loaded) return false;
        this.unload(true);
        log.info("Xemmet disabled");
        loaded = false;
        return true;
    };
    
    this.enable = () => {
        if (loaded) return false;
        this.load(true);
        log.info("Xemmet enabled");
        loaded = false;
        return true;
    };

    (function (ext) {
        var logging = require('ko/logging');
        
        var getConst = (_const) => {
            return ext[`get${_const}`]();
        };
        
        const logLevels = {
            debug: logging.LOG_DEBUG,
            info: logging.LOG_INFO,
            warn: log.LOG_WARN,
            error: log.LOG_ERROR,
            critical: log.LOG_CRITICAL
        };
        
        this.setLogLevel = (level) => {
            getConst("Logger").setLevel(logLevels[level]);
        };
        
        this.get = (_property) => {
            var property = ext.getProperty(_property);
            if (typeof(property) == "undefined") property = getConst(_property);
            return property;
        };
    }).apply(this.debug, [this]);
    
    (function() {
        var p = require('ko/prefs');
        
        this.setBool = (name, value) => p.setBoolean(name, value);
        this.setString = (name, value) => p.setString(name, value);
        this.setLong = (name, value) => p.setLong(name, value);
        
        this.getBool = (name, value) => p.getBoolean(name, value);
        this.getString = (name, value) => p.getString(name, value);
        this.getLong = (name, value) => p.getLong(name, value);
    }).apply(this.prefs);
    
    this._createSnippet = (text, noIndent) => {
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
    
    this._replaceWithTabstops = (text, search, block) => {
        var prepared = text.replace(search, block);
        return prepared;
    };
    
    this._prepareTabstops = (snippet, lang, custom) => {
        var i = 0;
        var cr = false;
        if (typeof(custom) != "undefined") {
            cr = true;
        }
        log.debug(`PrepareTabstops: snippet = ${snippet}; lang = ${lang}`);
        var prepared = this._replaceWithTabstops(snippet,
                                                 /\|/gmi,
                                                 () => {
                                                    if (cr) return custom;
                                                    return "[[%tabstop:]]";
                                                 });
        prepared = this._replaceWithTabstops(prepared,
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
        prepared = this._replaceWithTabstops(prepared,
                                             /\{\s*\}/gmi,
                                             () => {
                                                if (cr) return custom;
                                                i++;
                                                return `{[[%tabstop${i}:]]}`;
                                             });
        log.debug(`PrepareTabstops: return = ${prepared}`);
        return prepared;
    };
    
    this._getRootLanguage = (language) => {
        if (sublangs.html.indexOf(language) > -1) return "html";
        if (sublangs.css.indexOf(language) > -1) return "css";
        return language;
    };
    
    this._getSnippet = (language, text) => {
        var _return = snips.getSnippet(language, text);
        if (!_return.snippet) {
            return {isSnippet: false, text: text};
        }
        return {isSnippet: true, snippet: _return};
    };
    
    this._expandAbbreviation = (string, lang, no_beautify) => {
        var expand;
        try {
            expand = emmet.expandAbbreviation(string, lang);
            if (typeof(no_beautify) != "undefined" && no_beautify) {
                return expand;    
            }
            if (lang == "html") {
                expand = beautify.html(expand, {
                    indent_size: 1,
                    indent_char: "\t"
                });
            }
            return expand;
        } catch (e) {
            return string;
        }
    };
    
    this._isEmmetAbbreviation = (expandable, lang) => {
        if (this.prefs.getBool("xemmet_snippets_are_important", false) === true &&
            ko.abbrev._checkPossibleAbbreviation(expandable)) {
            log.info(`IsEmmetAbbreviation: there's a snippet for ${expandable}, canceling Xemmet handle..`);
            return [false, ""];
        }
        try {
            var expand, toExpand;
            var object = this._getSnippet(lang, expandable);
            if (object.isSnippet === false) {
                toExpand = `abbreviation: ${expandable}`;
                expand = emmet.expandAbbreviation(object.text, lang);
            } else {
                log.debug(`IsEmmetAbbreviation: expandable is a snippet, ignore..`);
                require('notify/notify').send(`Xemmet ${object.snippet.type} snippet "${object.snippet.name}" inserted`, {priority: "info", category: "xemmet"});
                return [true, object.snippet.text];
            }
            if (expand.trim().length === 0) {
                log.error(`IsEmmetAbbreviation: Emmet abbreviation is empty (invalid), got ${toExpand}`);
                return [false, ""];
            }
            log.debug(`IsEmmetAbbreviation: expand = ${expand}; object = ${object}`);
            if (lang == "html") {
                return [true, object.text];
            } else {
                return [true, expand];
            }
        } catch (e) {
            log.error(`IsEmmetAbbreviation: Invalid abbreviation: ${toExpand}`);
            return [false, ""];
        }
    };
    
    this._finalize = () => {
        log.info("Current string is not a valid Emmet abbreviation, pass it to Komodo handlers");
        return true;
    };
    
    this._proceedWrapSelection = (editor, lang) => {
        if (lang != "html") {
            require('notify/notify').send("Xemmet Wrap Selection works only with HTML-based languages", {
                priority: "info",
                category: "xemmet"
            });
            return;
        }
        var prompt = require('ko/dialogs').prompt("Enter Emmet abbreviation: ");
        if (prompt.indexOf("{}") == -1) {
            prompt += "{}"; // add placeholder for HTML, most CSS abbreviations already has a placeholder
        }
        var abbreviation = this._isEmmetAbbreviation(prompt, lang);
        if (abbreviation[0]) {
            var insert = this._prepareTabstops(abbreviation[1], lang, "{[[replace]]}");
            var expand = this._expandAbbreviation(insert, lang, true);
            log.debug("ProceedWrapSelection: to insert: " + expand);
            var selection = editor.getSelection();
            expand = expand.replace("[[replace]]", selection);
            try {
                expand = beautify.html(expand, {
                    indent_size: 1,
                    indent_char: "\t"
                });
            } catch (e) {
                require('notify/notify').send("Unable to beautify the result!", {
                    priority: "warn",
                    category: "xemmet"
                });
            }
            var snippet = this._createSnippet(expand, false);
            editor.replaceSelection("");
            ko.abbrev.insertAbbrevSnippet(snippet,
                                          require('ko/views').current().get());
        } else {
            require('notify/notify').send(`Abbreviation "${prompt}" is invalid`, {
                priority: "error",
                category: "xemmet"
            });
            return;
        }
    };
    
    this.onKeyDownListener = (e) => {
        var editor = require('ko/editor');
        var views = require('ko/views');
        var lang = this._getRootLanguage(views.current().get('language').toLowerCase());
        if (e.keyCode === 9) { // tab key
            if (e.ctrlKey) {
                log.debug("Listener: processing Ctrl+tab press...");
                if (editor.getSelection().trim().length > 0) {
                    e.preventDefault();
                    this._proceedWrapSelection(editor, lang);
                } else {
                    log.debug("Listener: no selection found");
                    return true;
                }
            } else {
                log.debug('Listener: Processing tab press...');
                
                var toExpand = editor.getLine().replace(/\t|\s{2,}/gm, "");
                
                log.debug(`Listener: Abbreviation before caret: ${toExpand}`);
                var abbreviation = this._isEmmetAbbreviation(toExpand, lang);
                if (abbreviation[0]) {
                    e.preventDefault();
                    var toInsert = this._prepareTabstops(abbreviation[1], lang);
                    var expand = this._expandAbbreviation(toInsert, lang);
                    var posStart = editor.getCursorPosition();
                    posStart.ch -= toExpand.length;
                    var posEnd = editor.getCursorPosition();
                    
                    editor.setSelection(
                        posStart,
                        posEnd
                    );
                    
                    editor.replaceSelection(""); // remove abbreviation
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
(function () {
    const emmet = require('./sdk/emmet');
    const snips = require('./extra/snippets');
    const log = require('ko/logging').getLogger('xemmet');    
    const sublangs = {
        html: ["html", "rhtml", "html4", "erb", "html.erb", "erb.html"],
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
    
    
    this.load = (silent) => {
        window.addEventListener('keydown', this.onKeyDownListener, true);
        log.setLevel(require('ko/logging').LOG_DEBUG);
        loaded = true;
        if (typeof(silent) != "undefined" && silent) return;
        log.info("Xemmet loaded");
    };
    
    this.unload = (silent) => {
        window.removeEventListener('keydown', this.onKeyDownListener, true);
        loaded = false;
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
        this.setPref = (name, value) => {
            try {
                if (typeof(value) == "boolean") {
                    require('ko/prefs').setBoolean(name, value);
                } else if (typeof(value) == "string") {
                    require('ko/prefs').setString(name, value);
                } else if (typeof(value) == "number") {
                    require('ko/prefs').setLong(name, value);
                } else {
                    return false;
                }
            } catch (e) {
                log.error(`Unable to set pref#<${name}>, an error occurred: ${e}`);
                return false;
            }
        };
        
        this.getPref = (name, value) => {
            try {
                if (typeof(value) == "boolean") {
                    return require('ko/prefs').getBoolean(name, value);
                } else if (typeof(value) == "string") {
                    return require('ko/prefs').getString(name, value);
                } else if (typeof(value) == "number") {
                    return require('ko/prefs').getLong(name, value);
                } else {
                    return false;
                }
            } catch (e) {
                log.error(`Unable to get pref#<${name}>, an error occurred: ${e}`);
                return false;
            }
        };
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
    
    this._prepareTabstops = (text) => {
        var i = 0;
        return this._replaceWithTabstops(text, /\{\s*\}/gmi, ()=>{i++; return `{[[%tabstop${i}:]]}`;});
    };
    
    this._getRootLanguage = (language) => {
        if (sublangs.html.indexOf(language) > -1) return "html";
        if (sublangs.css.indexOf(language) > -1) return "css";        
    };
    
    this._getSnippet = (language, text) => {
        return snips.getSnippet(language, text);
    };
    
    this._prepareSnippet = (lang, snippet) => {
        var nowrap = false;
        if (lang == "css") nowrap = true;
        log.debug(`Language: ${lang}, Snippet: ${snippet}`);
        var prepared = this._replaceWithTabstops(snippet,
                                                 /\|/gmi,
                                                 ()=>{
                                                    return "[[%tabstop:]]";
                                                 });
        prepared = this._replaceWithTabstops(prepared,
                                             /(\$\{(\d+|\w+)(?:\:(.+?))?\})/gmi,
                                             (_, g1, g2, g3) => {
                                                if (isNaN(g2)) {
                                                    g3 = g2;
                                                    g2 = "";
                                                }
                                                if (typeof(g3) == "undefined") g3 = "";
                                                return `[[%tabstop${g2}:${g3}]]`;
                                             });
        log.debug(`To insert: ${prepared}`);
        return prepared;
    };
    
    this._expandAbbreviation = (string) => {
        try {
            return emmet.expandAbbreviation(string);
        } catch (e) {
            return string;
        }
    };
    
    this._isEmmetAbbreviation = (expandable, lang) => {
        if (this.prefs.getPref("xemmet_snippets_are_important", false) === true &&
            ko.abbrev._checkPossibleAbbreviation(expandable)) {
            log.debug(`There's a snippet for ${expandable}, canceling Xemmet handle..`);
            return false;
        }
        if (this._getSnippet(lang, expandable) !== false) {
            return true; // this is a custom snippet, don't check it here
        }
        try {
            var abbr = emmet.expandAbbreviation(expandable, lang);
            if (abbr.trim().length === 0) {
                log.debug("Emmet abbreviation is invalid");
                return false;
            }
            return true;
        } catch (e) {
            log.debug("Emmet abbreviation was invalid");
            return false;
        }
    };
    
    this.onKeyDownListener = (e) => {
        var editor = require('ko/editor');
        var views = require('ko/views');
        var lang = this._getRootLanguage(views.current().get('language').toLowerCase());
        if (e.keyCode === 9) { // tab key
            log.debug('Processing tab press...');
            
            var toExpand = editor.getLine().replace(/\t|\s{2,}/gm, "");
            
            log.debug(`Abbreviation before caret: ${toExpand}`);
            
            if (this._isEmmetAbbreviation(toExpand, lang)) {
                var toInsert = null;
                var snippet = this._getSnippet(lang, toExpand);
                if (snippet === false) {
                    log.debug('Abbreviation is not a snippet, prepare {} tabstops');
                    toInsert = this._prepareTabstops(toExpand);
                } else {
                    log.debug('Abbreviation is a snippet, prepare | and ${} tabstops');
                    toInsert = this._prepareSnippet(lang, snippet);
                }
                var expand;
                if (!e.ctrlKey) {
                    try {
                        expand = this._expandAbbreviation(toInsert);
                        e.preventDefault();
                    } catch (e) {
                        if (snippet !== false) {
                            log.error(`Snippet ${snippet} is invalid`);
                        } else {
                            log.error(`Something gone wrong while expanding your abbreviation: ${e}`);
                        }
                        return true;
                    }
                } else {
                    expand = toInsert; // one-nested snippets 
                }
                
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
                log.debug("Not an abbreviation");
                return true;
            }
        }
    };
}).apply(module.exports);
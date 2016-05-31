(function() {
    
    const log = require("ko/logging").getLogger("xemmet")
    const {Cc, Ci} = require("chrome");
    
    var injectObserver;
    var injections = [];
    
    this.injectPref = function(o)
    {
        log.debug("Injecting a preference...", o);
        try
        {
            injections.push({
                basename: o.basename,
                siblingSelector: o.siblingSelector,
                prefname: o.prefname,
                caption: o.caption
            });
        }
        catch (e)
        {
            log.exception("Invalid arguments given", e);
        }
        
        // Register our observer
        if ( ! injectObserver)
        {
            console.log(injectObserver);
            injectObserver = true;
            
            var observerSvc = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
            observerSvc.addObserver(prefWindowObserver, "pref_page_loaded", false);
        }
    };
    
    var prefWindowObserver = {
        observe: function(subject, topic, data)
        {
            for (let o of injections)
            {
                let basename =  o.basename,
                    siblingSelector =  o.siblingSelector,
                    prefname = o.prefname,
                    caption = o.caption;
            
                if (data.indexOf(basename) == -1)
                    continue;
                
                // Find the main pref window
                var wm = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
                var windows = wm.getEnumerator("komodo_prefs");
                var contentWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
                if ( ! contentWindow)
                {
                    log.debug("Cannot find pref window, skipping injection");
                    continue;
                }
                
                // Find the smart editing pref page
                var frameWindow;
                for (let x=0;x<contentWindow.frames.length;x++)
                {
                    if (contentWindow.frames[x].location.href.indexOf(basename) !== -1)
                    {
                        frameWindow = contentWindow.frames[x];
                        break;
                    }
                }
                if ( ! frameWindow)
                {
                    log.debug("Cannot find frame window, skipping injection");
                    continue;
                }
                
                if (!frameWindow.onCheckboxPrefChanged) {
                    frameWindow.onCheckboxPrefChanged = (e, pref) => {
                        require('xemmet/xemmet').prefs.setBool(pref, e.target.hasAttribute('checked'));
                        log.debug("Changed preference " + pref + " to " + e.target.hasAttribute('checked'));
                    };
                }
                
                if (!frameWindow.addOrEditAbbreviation) {
                    frameWindow.addOrEditAbbreviation = (e, lang, snippet) => {
                        var prompt = require('ko/dialogs').prompt;
                        var config, editing;
                        editing = false;
                        if (typeof(snippet) != "undefined") {
                            config = {
                                label: "Snippet content:  ",
                                value: snippet.text,
                                multiline: true
                            };
                            editing = true;
                        } else {
                            config = {
                                label: "Abbreviation text: ",
                                value: "Name",
                                label2: "Snippet content:  ",
                                value2: "Emmet abbreviation",
                                multiline2: true
                            };
                        }
                        var data = prompt("Configuring a snippet", config);
                        if (editing) {
                            if (data.trim().length === 0) return false;
                            e.target.value = `${snippet.name}: ${data}`;
                            require('xemmet/extra/snippets').add(lang, snippet.name, data);
                        } else {
                            if (data[0].trim().length === 0 || data[1].trim().length === 0) return false;
                            require('xemmet/extra/snippets').add(lang, data[0], data[1]);
                        }
                    };
                }
                
                var cssSnippets = "";
                var htmlSnippets = "";
                var $ = require("ko/dom");
                var usnippets = require('xemmet/extra/snippets').getUserSnippets();
                for (var x in usnippets.css) {
                    var v = usnippets.css[x];
                    cssSnippets += $.create('label style="cursor: pointer"', {
                        value: `${x}: ${v}`,
                        onclick: `addOrEditAbbreviation(event, "css", {name: "${x}", text: "${v}"})`
                    }).toString();
                }
                
                for (var x in usnippets.html) {
                    var v = usnippets.html[x];
                    htmlSnippets += $.create('label style="cursor: pointer"', {
                        value: `${x}: ${v}`,
                        onclick: `addOrEditAbbreviation(event, "html", {name: "${x}", text: "${v}"})`
                    }).toString();
                }
                // Add our DOM structure
                var sibling = $(siblingSelector, frameWindow.document);
                var options = $.create("groupbox", {id: "xemmet-main"},
                    $.create
                    ('caption', {label: caption})
                    ('vbox align="left"',
                        $.create
                        ('checkbox', {id:            prefname,
                                     pref:          "true",
                                     label:         "Prioritize toolbox snippets over Xemmet snippets",
                                     prefstring:     prefname,
                                     preftype:      "boolean",
                                     oncommand:     'onCheckboxPrefChanged(event, "xemmet_snippets_are_important")'})
                        ('checkbox', {id:           "strict_mode",
                                     pref:          "true",
                                     label:         "Expand abbreviations only in HTML & CSS",
                                     prefstring:    "xemmet_strict_mode",
                                     preftype:      "boolean",
                                     oncommand:     'onCheckboxPrefChanged(event, "xemmet_strict_mode")'})
                    )
                );
                sibling.after(options.toString());
                sibling = $("#xemmet-main", frameWindow.document);
                options = $.create('groupbox', {id: "xemmet-css"},
                    $.create
                    ('groupbox',
                        $.create
                        ('caption', {label: "Xemmet CSS snippets"})
                        ('hbox align="center"',
                            $.create
                            ('button', {label:          "Add a snippet",
                                        oncommand:      'addOrEditAbbreviation(event, "css")',
                                        flex:           '1'})
                            ('vbox align="left"', {flex: 6}, cssSnippets)
                        )
                    )
                );
                sibling.after(options.toString());
                sibling = $("#xemmet-css", frameWindow.document);
                options = $.create('groupbox', {id: "xemmet-html"},
                    $.create
                    ('groupbox',
                        $.create
                        ('caption', {label: "Xemmet HTML snippets"})
                        ('hbox align="center"',
                            $.create
                            ('button', {label:          "Add a snippet",
                                        oncommand:      'addOrEditAbbreviation(event, "html")',
                                        flex:           '1'})
                            ('vbox align="left"', {flex: 6}, htmlSnippets)
                        )
                    )
                );
                sibling.after(options.toString());
                log.debug("Creating an injection..." + JSON.stringify(o));
            }
        }
    };
    
}).apply(module.exports);
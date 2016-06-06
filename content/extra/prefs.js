(function() {
    
    const log = require("ko/logging").getLogger("xemmet");
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
                var $ = require("ko/dom");
                if ($("#xemmet-main", frameWindow.document).length > 0) {
                    log.debug("The pref is already injected into current DOM, skipping");
                    continue;
                }
                // Add our DOM structure
                var sibling = $(siblingSelector, frameWindow.document);
                var options = $.create("groupbox", {id: "xemmet-main"},
                    $.create
                    ('caption', {label: caption})
                    ('vbox align="left"', {id: "xemmet-main-vbox"},
                        $.create
                        ('textbox', {id:            "xemmet_css_langs",
                                     flex:          "1",
                                     pref:          "true",
                                     prefstring:    "xemmet_css_languages",
                                     prefattribute: "value",
                                     placeholder:   "Additional CSS Language Names that Xemmet should run on"})
                        ('textbox', {id:            "xemmet_html_langs",
                                     flex:          "1",
                                     pref:          "true",
                                     prefstring:    "xemmet_html_languages",
                                     prefattribute: "value",
                                     placeholder:   "Additional HTML Language Names that Xemmet should run on"})
                    )
                );
                sibling.after(options.toString());
                var important_snippets = require('ko/ui/checkbox')
                                         .create("Prioritize toolbox snippets over Xemmet snippets");
                important_snippets.checked(require('xemmet/xemmet').prefs.getBool("xemmet_prioritize_snippets", true));
                
                var strict_mode = require('ko/ui/checkbox')
                                  .create("Xemmet only works for HTML and CSS based languages");
                strict_mode.checked(require('xemmet/xemmet').prefs.getBool("xemmet_strict_mode", true));
                
                var wrap_strict_mode = require('ko/ui/checkbox')
                                       .create("Wrap selection only works for HTML based languages");
                wrap_strict_mode.checked(require('xemmet/xemmet').prefs.getBool("xemmet_wrap_strict_mode", true));
                
                var xemmet_enabled = require('ko/ui/checkbox')
                                     .create("Enable Xemmet");
                xemmet_enabled.checked(require('xemmet/xemmet').prefs.getBool("xemmet_enabled", true));
                
                var target = $("#xemmet-main-vbox", frameWindow.document);
                target.prepend(wrap_strict_mode.$element);
                target.prepend(strict_mode.$element);
                target.prepend(important_snippets.$element);
                target.prepend(xemmet_enabled.$element);
                
                log.debug("Created an injection: " + JSON.stringify(o));
            }
        }
    };
    
}).apply(module.exports);
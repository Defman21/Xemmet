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
                log.debug(JSON.stringify(o));
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
                
                var xemmet = require('xemmet/xemmet');
                var strict_mode        = require('ko/ui/checkbox')
                                         .create("Xemmet only works for HTML and CSS based languages");
                var wrap_strict_mode   = require('ko/ui/checkbox')
                                         .create("Wrap selection only works for HTML based languages");
                var xemmet_enabled     = require('ko/ui/checkbox')
                                         .create("Enable Xemmet");
                
                var prefs = [
                    ["xemmet_strict_mode", true],
                    ["xemmet_wrap_strict_mode", true],
                    ["xemmet_enabled", true]
                ];
                
                var target = $("#xemmet-main-vbox", frameWindow.document);
                
                [strict_mode, wrap_strict_mode, xemmet_enabled].forEach((e, i) => {
                    e.checked(xemmet.prefs.getBool(prefs[i][0], prefs[i][1]));
                    e.$element.attr('id', prefs[i][0]);
                    e.$element.attr('pref', true);
                    e.$element.attr('preftype', 'boolean');
                    target.prepend(e.$element);
                });
                
                log.debug("Created an injection: " + JSON.stringify(o));
            }
        }
    };
    
}).apply(module.exports);
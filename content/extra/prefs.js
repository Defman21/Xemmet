(function() {
    
    const log = require("ko/logging").getLogger("xemmet")
    const {Cc, Ci} = require("chrome");
    
    var injectObserver = false;
    var injections = [];
    
    this.injectInterpreterPref = function(o)
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
                log.debug("Creating an injection...");
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
                    frameWindow.onCheckboxPrefChanged = (e) => {
                        require('xemmet/xemmet').prefs.setBool('xemmet_snippets_are_important', e.target.hasAttribute('checked'));
                        log.debug("Changed preference xemmet_snippets_are_important to " + e.target.hasAttribute('checked'));
                    };
                }
                
                // Add our DOM structure
                var $ = require("ko/dom");
                var sibling = $(siblingSelector, frameWindow.document);
                var options = $.create("groupbox",
                    $.create
                    ('caption', {label: caption})
                    ('hbox align="center"',
                        $.create
                        ('checkbox', {id:            prefname,
                                     flex:          "1",
                                     pref:          "true",
                                     label:         "Make Toolbox snippets be more important than Xemmet snippets",
                                     prefstring:     prefname,
                                     preftype:      "boolean",
                                     oncommand:     'onCheckboxPrefChanged(event)'})
                    )
                );
                sibling.after(options.toString());
            }
        }
    };
    
}).apply(module.exports);
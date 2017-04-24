(function() {
    var css = require('./lib/beautify-css');
    var html = require('./lib/beautify-html');
    
    var get_beautify = (css_beautify, html_beautify) => {
        var beautify = function (src, config) {
            return js_beautify.html_beautify(src, config);
        };
    
        // short aliases
        beautify.css  = css_beautify.css_beautify;
        beautify.html = html_beautify.html_beautify;
    
        // legacy aliases
        beautify.css_beautify  = css_beautify.css_beautify;
        beautify.html_beautify = html_beautify.html_beautify;
        
        beautify.komodo = true;
    
        return beautify;
    };
    
    this.exports = get_beautify(css, html);
}).apply(module);

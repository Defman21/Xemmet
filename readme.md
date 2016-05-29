Xemmet
======

## Current state: alpha

Emmet for Komodo X.

What's already implemented:

 * Expand abbreviation (by Tab) in HTML (+sub-languages, like RHTML) and
 CSS (+sub-languages, like SCSS)

##### Note: it works only if the abbreviation is on a new line.

## Documentation for professionals

#### Placeholder formats

There are 4 types of placeholders:

 * `|` - unnamed placeholder (works only in snippets)
 * `{}` - unnamed placeholder (works only in HTML abbreviations)
 * `${name}` - named placeholder (works only in snippets)
 * `${i:name}` named group placeholder (works only in snippets)
 
Group placeholder is useful when you're creating a snippet for a css property
that has different prefixes, like `filter`.

With the code below:
```
.kill_me {
    fil
}
```

With the snippet below:

```
"fil": "filter: ${1:blur()};\n\t-webkit-filter: ${1:blur()};"
```

`fil`<kbd>[Tab]</kbd> will transform the code to:
```
.kill_me {
    filter: [blur()];
    -webkit-filter: [blur()];
}
```

And once you start typing, both `blur()` of filter and -webkit-filter will be
changed.

Don't use nesting in snippets, it doesn't work.
Snippets could contain Emmet abbreviation. By default, when you press tab
for expanding such snippets, they expands in HTML. If you want to expand them
to Emmet abbreviation, hold Ctrl and press Tab.

Example:

```
doc[tab]:
<html><head><meta charset="UTF-8"></meta><title>%tabstop</title></head><body></body></html>

doc[ctrl+tab]:
html>(head>meta[charset=UTF-8]+title{%tabstop})+body
```

Xemmet
======

## Current state: alpha

Emmet for Komodo X.

Features:

 * Expand abbreviation (by Tab) in HTML (+sub-languages, like RHTML) and
 CSS (+sub-languages, like SCSS)
 * Wrap Selection with Abbreviation (HTML-only)
 * Custom snippets

##### Note: Expand abbreviation works only if the abbreviation is on a new line.

##### Note 2: in CSS, there will be auto-completions by Komodo. You need to press Esc to get rid of them and then press Tab to expand your abbreviation.


## Custom snippets

You can add them via Console tab in bottom pane:

`require('xemmet/extra/snippets').add(language, name, value);`

They will be automatically saved.

If you want to update a snippet, just call `.add` again with the name of snippet you want to update. It will be replaced with the one you pass to
the function.

They are placed at `%komodo_user_dir%/snippets.xmt.json`.

Format of the file:

```json
{
    "css": {
        "%snippet_name%": "%snippet_content%"
    },
    "html": {
        "%snippet_name%": "%snippet_content%"
    }
}
```

`%snippet_content%` could be:

* Emmet abbreviation
* Raw HTML
* Raw CSS

## Wrap selection

Create a selection, press Ctrl+Tab. You'll get a prompt for Emmet abbreviation.
It **should** support custom snippets, but I didn't test it.

Enter your abbreviation and press Enter. If there will be an error with
beautifying your result, it will be inserted as is.
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


## Custom snippets

They should be placed at `%komodo_user_dir%/snippets.xmt.json`.
For reference, look at `content/extra/snippets.js`

Format of the file:

```json
{
    "css": {
        "snippets": {
            "%snippet_name%": "%snippet_content%" (could be CSS or Emmet snippet)
        }
    },
    "html": {
        "snippets": {
            "%snippet_name%": "%snippet_content%" (could be HTML or Emmet snippet)
        }
    }
}
```

## Wrap selection

Create a selection, press Ctrl+Tab. You'll get a prompt for Emmet abbreviation.
It **should** support custom snippets, but I didn't test it.

Enter your abbreviation and press Enter. If there will be an error with
beautifying your result, it will be inserted as is.
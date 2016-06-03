Xemmet
======

Emmet for Komodo X.

Features:

 * Expand abbreviations (by Tab) in: HTML, RHTML, ERB, CSS, SCSS, LESS
 * Wrap Selection with Abbreviation in HTML
 * Custom snippets
 * Custom file formats where Xemmet should work

## Expand abbreviations

This is the main feature of this add-on. It could expand `div>h1{Hello}` to
```html
<div>
    <h1>Hello</h1>
</div>
```

See Emmet documentation for more information.

## Wrap Selection

In HTML, you can select a block of text or code, and press <kbd>Ctrl+Tab</kbd>
to wrap the selection with an Emmet abbreviation. Xemmet will notice you
when you Enter Wrap Abbreviation mode. Don't remove your selection, just start
typing an abbreviation. Once you're done, press Tab to complete the action.

By default, this feature works only in HTML, RHTML and ERB (to avoid bugs).
If you want to able to use this feature in any language, go to Prefs - Smart
Editing, find Xemmet and disable **both** "Xemmet works only in HTML & CSS" and
"Wrap Selection works only in HTML".

I'd not recommend to disable these options.

To leave the mode, press Esc.

## Custom snippets

You can add or modify your snippets in Preferences - Smart Editing.

**NOTE:** new snippets won't appear immediately after you've added them.

To modify a snippet, just press on it. Your changes will be displayed
immediately.

## Custom file formats

By default, Xemmet works only in specific HTML-/CSS-like languages (such as
ERB, LESS, CSS). If you want to add more languages where Xemmet should work,
go to Prefs - Smart Editing. There are 2 textboxes where you can write languages
where you want to see Xemmet actions.
Xemmet
======

Emmet for Komodo X.

This add-on implements only Expand Abbreviation and Wrap Selection features
from Emmet. If you want to get all features, install [Emmet for Komodo][1]

[1]: https://github.com/Defman21/komodo-emmet

## Expand abbreviations

This is the main feature of this add-on. It could expand
`ul#nav>li.item$*4>a{Item $}` to
```html
<ul id="nav">
    <li class="item1"><a>Item 1</a></li>
    <li class="item2"><a>Item 2</a></li>
    <li class="item3"><a>Item 3</a></li>
    <li class="item4"><a>Item 4</a></li>
</ul>
```

See Emmet documentation for more information.

## Wrap Selection

In HTML, you can make a selection and press <kbd>Ctrl+Tab</kbd>
to enter Wrap Selection mode. Replace your selection with Emmmet
abbreviation. Once you're done, press Tab to wrap your selection with
your abbreviation.

By default, this feature works only in HTML based languages.
You can disable this limitation in Prefs - Smart Editing.

I'd not recommend to disable these options.

To leave this mode, press Esc.

## Custom snippets

See [Emmet docs](http://docs.emmet.io/customization/snippets/).

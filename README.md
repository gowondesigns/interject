# In ~~ter~~ ject

Interject is a SVG injector plugin for jQuery. Interject can dynamically replace image tags with the full SVG markup for manipulation in the document. Interject caches the SVG images to reduce overhead during replacement.

## Usage

1\. Add jQuery and Interject to your HTML document

```html
<script src="http://code.jquery.com/jquery-2.1.0.min.js"></script>
<script src="jquery.interject.min.js"></script>
```

2\. Add a common class to your SVG images that you want to have interjected

```html
<img class="svg" src="graphic.svg" />
```

3\. Inject the SVG into the document with this command

```js
$("img.svg").interject_svg();
$("img.svg").interject_svg({cache: false});
```

## Copyright and License

Copyright &copy; 2014 Gowon Patterson, Gowon Designs.

This program is distributed under the terms of the [GNU General Public License Version 3](http://www.gnu.org/licenses/gpl-3.0.html).

/*!
 * Interject - Inline SVG injector
 */

;
(function ($, window, undefined) {
    if (!$.Interject) {
        $.Interject = {};
    }

    // localStorage Cache
    var cache_localStorage = {
            _values: false,
            _keys: [],
            remove: function (key) {
                var index = this._keys.indexOf(key);
                if (index > -1) {
                    localStorage.removeItem(key);
                    this._keys.splice(index, 1);
                }
            },
            exist: function (key) {
                if (this._keys.indexOf(key) > -1) {
                    return true;
                }
                else if (localStorage.getItem(key) !== null) {
                    this._keys.push(key);
                    return true;
                }
                return false;
            },
            get: function (key) {
                if (this._keys.indexOf(key) == -1) this._keys.push(key);
                return localStorage.getItem(key);
            },
            set: function (key, value, callback) {
                if (value instanceof SVGSVGElement) {
                    var stringified = new XMLSerializer().serializeToString(value);
                    localStorage.setItem(key, stringified);
                    this._keys.push(key);

                    if (callback instanceof Function) callback(value);
                    return;
                }
                throw new Error(value + " is not of type [object SVGSVGElement].");
            },
            clear: function () {
                this._keys.forEach(function (key) {
                    localStorage.removeItem(key);
                });
                this._keys = [];
            }
        },

    // If no localStorage is present, cache in RAM. Not as useful.
    // http://stackoverflow.com/questions/17104265/caching-a-jquery-ajax-response-in-javascript-browser
        cache_ram = {
            _values: [],
            _keys: [],
            remove: function (key) {
                var index = this._keys.indexOf(key);
                if (index > -1) {
                    this._values.splice(index, 1);
                    this._keys.splice(index, 1);
                }
            },
            exist: function (key) {
                return this._keys.indexOf(key) > -1;
            },
            get: function (key) {
                var index = this._keys.indexOf(key);
                if (index > -1) {
                    return this._values[index];
                }
                return null;
            },
            set: function (key, value, callback) {
                this.remove(key);
                this._keys.push(key);
                this._values.push(value);
                if (callback instanceof Function) callback(value);
            },
            clear: function () {
                this._keys = [];
                this._values = [];
            }
        },
        localStorageSupported = false;

    // Check if localstorage is supported
    try {
        localStorageSupported = 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
    }

    $.Interject.Cache = localStorageSupported ? cache_localStorage : cache_ram;

    $.Interject.Svg = function (el, options) {
        // To avoid scope issues, use 'base' instead of 'this'
        // to reference this class from internal events and functions.
        var base = this;

        // Access to jQuery and DOM versions of element
        base.$el = $(el);
        base.el = el;

        // Add a reverse reference to the DOM object
        base.$el.data("Interject.Svg", base);

        base.init = function () {
            base.options = $.extend({}, $.Interject.Options, options);
        };

        // Run initializer
        base.init();

        var $img = base.$el;
        var imgID = $img.attr('id');
        var imgClass = $img.attr('class');
        var imgURL = $img.attr('src');

        $.ajax({
            url: imgURL,
            async: true,
            cache: base.options.cache,
            success: function (data) {
                // Get the SVG tag, ignore the rest
                var $svg = $(data).find('svg');
                // Add replaced image's ID to the new SVG
                if (typeof imgID !== 'undefined') {
                    $svg = $svg.attr('id', imgID);
                }
                // Add replaced image's classes to the new SVG
                if (typeof imgClass !== 'undefined') {
                    $svg = $svg.attr('class', imgClass + ' replaced-svg');
                }
                // Remove any invalid XML tags as per http://validator.w3.org
                $svg = $svg.removeAttr('xmlns:a');
                // Replace image with new SVG
                $img.replaceWith($svg);
                if (base.options.cache) $.Interject.Cache.set(imgURL, $svg[0]);
            },
            beforeSend: function () {
                if (base.options.cache && $.Interject.Cache.exist(imgURL)) {
                    $img.replaceWith($.Interject.Cache.get(imgURL));
                    return false;
                }
                return true;
            }
        });
    };

    $.Interject.Options = {
        cache: true
    };

    $.fn.interject_svg = function (options) {
        return this.each(function () {
            (new $.Interject.Svg(this, options));
        });
    };

    $.fn.interject_clear_cache = function () {
        $.Interject.Cache.clear();
        return this;
    };
}(jQuery, window));
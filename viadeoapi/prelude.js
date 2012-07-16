// ============================================================================
// VIADEO GRAPH API CONNECTOR -- NODE.JS FRAMEWORK FOR A BETTER WORLD WITH APIs
//                   XLP - eXecution and Loading Planner
// ============================================================================
//             www.viadeo.com - api.video.com - dev.viadeo.com
//
//             Copyright (C) Viadeo 2011 - All rights reserved
// ============================================================================
//              Highly inspired from Facebook connect JS SDK
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// @provides vd.prelude
//
// ============================================================================

// == NODE/XLP/BROWSER COMPATIBILITY TRICKS ===================================
if (typeof window == 'undefined') {
	window = function () {};
}
if (typeof module == 'undefined' && typeof window.module == 'undefined') {
	module = {};
}
// ============================================================================

var apimodule_prelude = function (VD) {

    var initVD = {

        // use the init method to set these values correctly
        _apiKey: null,
        _session: null,
        _userStatus: 'unknown', // or 'notConnected' or 'connected'
        _cookieName: null,

        // logging is enabled by default. this is the logging shown to the
        // developer and not at all noisy.
        _logging: true,

        // --------------------------------------------------------------------

        /**
         * Copies things from source into target.
         *
         * @access private
         * @param target    {Object}  the target object where things will be copied
         *                            into
         * @param source    {Object}  the source object where things will be copied
         *                            from
         * @param overwrite {Boolean} indicate if existing items should be
         *                            overwritten
         * @param tranform  {function} [Optional], transformation function for
         *        each item
         */
        copy: function(target, source, overwrite, transform) {
            for (var key in source) {
                if (overwrite || typeof target[key] === 'undefined') {
                    target[key] = transform ? transform(source[key]) : source[key];
                }
            }
            return target;
        },

        // --------------------------------------------------------------------

        /**
         * Create a namespaced object.
         *
         * @access private
         * @param name {String} full qualified name ('Util.foo', etc.)
         * @param value {Object} value to set. Default value is {}. [Optional]
         * @return {Object} The created object
         */
        create: function(name, value) {
            var node = VD, // We will use 'VD' as root namespace
                nameParts = name ? name.split('.') : [],
                c = nameParts.length;

            for (var i = 0; i < c; i++) {
                var part = nameParts[i];
                var nso = node[part];
                if ( ! nso ) {
                    nso = (value && i + 1 == c) ? value : {};
                    node[part] = nso;
                }
                node = nso;
            }
            return node;
        },

        // --------------------------------------------------------------------

        /**
         * Copy stuff from one object to the specified namespace that
         * is VD.<target>.
         * If the namespace target doesn't exist, it will be created automatically.
         *
         * @access private
         * @param target    {Object|String}  the target object to copy into
         * @param source    {Object}         the source object to copy from
         * @param overwrite {Boolean}        indicate if we should overwrite
         * @return {Object} the *same* target object back
         */
        provide: function(target, source, overwrite) {
            // a string means a dot separated object that gets appended to, or created
            return VD.copy (
                typeof target == 'string' ? VD.create(target) : target,
                source, overwrite
            );
        },

        // --------------------------------------------------------------------

        /**
         * Generates a weak random ID.
         *
         * @access private
         * @return {String} a random ID
         */
        guid: function() {
            return 'f' + (Math.random() * (1<<30)).toString(16).replace('.', '');
        },

        // --------------------------------------------------------------------

        /**
         * Logs a message for the developer if logging is on.
         *
         * @access private
         * @param args {Object} the thing to log
         */
        log: function(args) {
            if (VD._logging) {
//#JSCOVERAGE_IF 0
                if (window.Debug && window.Debug.writeln) {
                    window.Debug.writeln(args);
                } else if (window.console) {
                    window.console.log(args);
                }
//#JSCOVERAGE_ENDIF
            }

            // fire an event if the event system is available
            if (VD.Event) {
                VD.Event.fire('vd.log', args);
            }
        },

        // --------------------------------------------------------------------

        /**
         * Logs an error message for the developer.
         *
         * @access private
         * @param args {Object} the thing to log
         */
        error: function(args) {
//#JSCOVERAGE_IF 0
            if (window.console) {
                window.console.error('Error JS coverage :' + args);
            }
//#JSCOVERAGE_ENDIF

            // fire an event if the event system is available
            if (VD.Event) {
                VD.Event.fire('vd.error', args);
            }
        },

        // --------------------------------------------------------------------

        /**
         * Shortcut for document.getElementById
         * @method $
         * @param {string} DOM id
         * @return DOMElement
         * @access private
         */
        $: function(id) {
            return document.getElementById(id);
        }
    };

    for (var item in initVD) {
    	VD[item] = initVD[item];
    }

};

// ----------------------------------------------------------------------------

if ( typeof exports == 'undefined' ) {
	window.exports = {};
}

// ----------------------------------------------------------------------------

var init = this.init = exports.init = apimodule_prelude;
if ( typeof(window) != 'undefined' ) {
	window.VD = {};
	init(window.VD);
}


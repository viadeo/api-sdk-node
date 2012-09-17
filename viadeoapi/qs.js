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
// @provides vd.qs
// @requires vd.prelude vd.array
//
// ============================================================================

// == NODE/XLP/BROWSER COMPATIBILITY TRICKS ===================================
var require = require;
// ============================================================================

var apimodule_qs = function (VD) {

    VD.provide('QS', {

         /**
         * Encode parameters to a query string.
         *
         * @access private
         * @param   object {Object}  the parameters to encode
         * @param   sep    {String}  the separator string (defaults to '&')
         * @param   enc    {Boolean} indicate if the key/value should be URI encoded (defaults to true)
         * @param   base   {String}  the parameters base path
         * @return         {String}  the query string
         */
        encode: function(object, sep, enc, base) {
            var
                queryString = [],
                fillObject = function(val, i){
                    qs[i] = val;
                },
                value, result, qs, key
            ;

            for(key in object) {
                value = object[key];
                if (base) key = base; // Should be key = base + '[' + key + ']' but the API sux
                if (value instanceof Object) {
                    result = VD.QS.encode(value, sep, enc, key);
                } else if (value instanceof Array) {
                    qs = {};
                    value.each(fillObject);
                    result = VD.QS.encode(qs, sep, enc, key);
                } else {
                    result = key + '=' + (enc === false ? value : encodeURIComponent(value));
                }
                if (value !== null) queryString.push(result);
            }

            return queryString.join(sep || '&');
        },

        // --------------------------------------------------------------------

        /**
         * Decode a query string into a parameters object.
         *
         * @access private
         * @param   str {String} the query string
         * @return      {Object} the parameters to encode
         */
        decode: function(str) {

            var decode = decodeURIComponent,
                params = {},
                parts  = decode(str).split('&'),
                i,
                pair;

            for (i = 0; i < parts.length; i++) {
                pair = parts[i].split('=', 2);
                if (pair && pair[0]) {
                    params[decode(pair[0])] = pair[1] ? decode(pair[1].replace(/\+/g, '%20')) : '';
                }
            }

            return params;
        }
    });

};

// ----------------------------------------------------------------------------

var init = this.init = exports.init = apimodule_qs;
if ( typeof window.document != 'undefined' && typeof XLP == 'undefined' ) {
    init(window.VD);
}


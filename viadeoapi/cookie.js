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
// @provides vd.cookie
// @requires vd.prelude
//           vd.qs
//
// ============================================================================

// == NODE/XLP/BROWSER COMPATIBILITY TRICKS ===================================
var require = require;
var document = window.document;
document = (typeof document == 'undefined') ? { cookie: ''} : document;
// ============================================================================

var apimodule_cookie = function (VD) {

    VD.provide('Cookie', {
        _domain: null,
        _enabled: false,

        // --------------------------------------------------------------------

        setEnabled: function(val) {
			VD.Cookie._enabled = val;
        },

        getEnabled: function() {
            return VD.Cookie._enabled;
        },

        // --------------------------------------------------------------------

		getViadeo: function(nodeReq) {
	        if (!nodeReq) {
                cookie = document.cookie;
            } else if (nodeReq != -1) {
                cookie = nodeReq.headers.cookie || '';
            } else {
                return null;
            }

            console.log("COOKIE RAW: ", cookie);
            cookie = cookie.match('\\brememberMe=([^;,]*)\\b');

            if (cookie) {
                console.log("CATCHED: ", cookie[1]);
            }

            if (cookie) {
				return cookie[1];
			}
			return null;
		},


        /**
         * Try loading the session from the Cookie.
         *
         * @access private
         * @return {Object} the session object from the cookie if one is found
         */
        load: function(nodeReq) {

            // note, we have the opening quote for the value in the regex, but do
            // not have a closing quote. this is because the \b already handles it.
            var cookie = null,
                session = null,
                cookieName = VD._cookieName
            ;

            if (!nodeReq) {
                cookie = document.cookie;
            } else if (nodeReq != -1) {
                cookie = nodeReq.headers.cookie || '';
            } else {
                return null;
            }

            cookie = cookie.match('\\b' + cookieName + '="?([^;,]*)\\b');

            vd = VD.Cookie.getViadeo(nodeReq);

            console.log("COOKIE VD IN LOAD: " + vd); 

            if (cookie) {
                // url encoded session stored as "sub-cookies"
                session = VD.QS.decode(cookie[1]);
                console.log("SESSION FROM COOKIE: ", session);
				if (vd != session.vd) {
                    console.log("RETURN NULL COOKIE");
					return null;
				}
                // decodes as a string, convert to a number
                session.expires = parseInt(session.expires, 10);
                // capture base_domain for use when we need to clear
                VD.Cookie._domain = session.base_domain;
            }

            return session;
        },

        // --------------------------------------------------------------------

        /**
         * Helper function to set cookie value.

         *
         * @access private
         * @param val    {String} the string value (should already be encoded)
         * @param ts     {Number} a unix timestamp denoting expiry
         * @param domain {String} optional domain for cookie

         */
        setRaw: function(val, ts, domain, nodeReq, originalCookie) {
            var cookieName = originalCookie || VD._cookieName;
            var expires    = (val && ts == 0) ? null : new Date(ts * 1000);
			var nodeReq;

            if (typeof(window.document) == 'undefined') { // Node
                if (nodeReq) {
                    nodeReq.res.cookie(cookieName, val, 
                                       {
                                        expires: expires, 
                                        domain: domain, 
                                        path: '/', 
                                        httpOnly: false 
                                       }
                                      );
                }
            } else { // Browser
                document.cookie = cookieName + '="' + val + '"'
                                + (expires ? '; expires=' + expires : '')
                                + '; path=/'
                                + (domain ? '; domain=' + domain : '') ;
            }
        },

        // --------------------------------------------------------------------

        /**
         * Set the cookie using the given session object.

         *
         * @access private
         * @param session {Object} the session object
         */
        set: function(session, nodeReq) {
            if (session) {
                session.vd = VD.Cookie.getViadeo(nodeReq);
                console.log("SET VD COOKIE: ", session);
                if(isNaN(session.expires)){
                    session.expires = 0;
                }
                VD.Cookie.setRaw(VD.QS.encode(session), session.expires, session.base_domain, nodeReq);
                VD.Cookie._domain = session.base_domain;
            }
        },

        // --------------------------------------------------------------------

        /**
         * Clear the cookie.
         *
         * @access private
         */
        clear: function(nodeReq) {
            console.log('clear cookie');
            VD.Cookie.setRaw('', 0, VD.Cookie._domain, nodeReq);
        },

        // --------------------------------------------------------------------

        clearWeb: function(nodeReq, domain) {
            console.log('clear web cookie');
            var cookies = [ 'apiRememberMe', 'rememberMe', 'autoReconnect', 'stayConnected' ];
            for ( id in cookies ) {
                VD.Cookie.setRaw('', 0, domain, nodeReq, cookies[id]);
            }
        },

    });

};

// ----------------------------------------------------------------------------

var init = this.init = exports.init = apimodule_cookie;
if ( typeof window.document != 'undefined' && typeof XLP == 'undefined' ) {
    init(window.VD);
}



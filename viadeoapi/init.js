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
// @provides vd.init
// @requires vd.prelude
//           vd.auth
//           vd.api
//           vd.cookie
//
// ============================================================================

// == NODE/XLP/BROWSER COMPATIBILITY TRICKS ===================================
if (typeof window.document == 'undefined') {
    window = function () { };
	window.setTimeout = function(x, y) {};
}

if ( ! window.console ) {
    window.console = { log: function(msg) {}, error: function(msg) {} };
}

var require = require;
// ============================================================================

var apimodule_init = function (VD) {

    VD.provide('', {

        init: function(options) {
            // only need to list values here that do not already have a falsy default.
            // this is why cookie/session/status are not listed here.
            options = VD.copy(options || {}, {
                logging: true
            });

            VD._apiKey = options.apiKey;
            if ((typeof(options.cookieName) == 'undefined') || ( ! options.cookieName ) ) {
                var config = require('config').get();
                if (typeof(config.api.cookieName) != 'undefined') {
                    options.cookieName = config.api.cookieName;
                } else {
                    options.cookieName = null;
                }
            }
            VD._cookieName = options.cookieName || "vds_" + VD._apiKey;
            VD._accessToken = options.access_token;

            // disable logging if told to do so, but only if the url doesnt have the
            // token to turn it on. this allows for easier debugging of third party
            // sites even if logging has been turned off.
            if (!options.logging && window.location.toString().indexOf('vd_debug=1') < 0) {
                VD._logging = false;
            }

            if (VD._apiKey) {
                // enable cookie support if told to do so
                VD.Cookie.setEnabled(options.cookie);

                // if an explicit session was not given, try to _read_ an existing cookie.
                // we dont enable writing automatically, but we do read automatically.
                options.session = options.session || VD.Auth._receivedSession || VD.Cookie.load();

                // set the session
                VD.Auth.setSession(options.session, options.session ? 'connected' : 'unknown');

                // load a fresh session if requested
                if (options.status) {
                    VD.getLoginStatus();
                }
            }
        }
    });

    // ------------------------------------------------------------------------

    // this is useful when the library is being loaded asynchronously
    //
    // we do it in a setTimeout to wait until the current event loop as finished.
    // this allows potential library code being included below this block (possible
    // when being served from an automatically combined version)
    window.setTimeout(function() { if (window.vdAsyncInit) { vdAsyncInit(); }}, 0);

};

// ----------------------------------------------------------------------------

var init = this.init = exports.init = apimodule_init;
if ( typeof window.document != 'undefined' && typeof XLP == 'undefined' ) {
    init(window.VD);
}


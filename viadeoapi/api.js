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
// @provides vd.api
// @requires vd.prelude
//           vd.qs
//           vd.json
//           vd.array
//
// ============================================================================

var apimodule_api = function (VD) {

    VD.provide('', {
        api: function()
        {
            VD.ApiServer.call.apply(VD.ApiServer, arguments);
        }
    });

    // ------------------------------------------------------------------------

    var config          = require('config').get();
    var config_endpoint = config.api.api_uri;

    // ------------------------------------------------------------------------

    VD.provide('ApiServer', {

        METHODS: ['get', 'post', 'put', 'delete'],
        endpoint: undefined,
        host: undefined,
        port: undefined,
        proto: undefined,
        _callbacks: {},

        // --------------------------------------------------------------------

        /**
         * Sets the API ase url
         *
         * setUrl('http://....');
         * setUrl() default to configuration
         *
         */
        setUrl: function(url) {
            url = url || config_endpoint;

            var regexp   = /^(https?):\/\/([^\/:]+)(:([0-9]+))?\/?$/;
            var matches  = regexp.exec(url);

            VD.ApiServer.proto    = matches[1];
            try {
                VD.ApiServer.port = matches[4];
            } catch (e) { /* ignore */ }

            if ( ! VD.ApiServer.port ) {
                VD.ApiServer.port = (VD.ApiServer.proto == 'http') ? 80 : 443;
            }
            VD.ApiServer.host     = matches[2];
            VD.ApiServer.endpoint = url;
        },


        // --------------------------------------------------------------------

        /**
         * Make a API call to Viadeo's RESTful API.
         *
         * Except the path, all arguments to this function are optional. So any of
         * these are valid:
         *
         *   VD.api('/me') // throw away the response
         *   VD.api('/me', function(r) { console.log(r) })
         *   VD.api('/me', { fields: 'email' }); // throw away response
         *   VD.api('/me', { fields: 'email' }, function(r) { console.log(r) });
         *   VD.api('/12345678', 'delete', function(r) { console.log(r) });
         *   VD.api(
         *     '/me/feed',
         *     'post',
         *     { body: 'hi there' },
         *     function(r) { console.log(r) }
         *   );
         *
         * @access private
         * @param path   {String}   the url path
         * @param method {String}   the http method
         * @param params {Object}   the parameters for the query
         * @param cb     {Function} the callback function to handle the response
         */
        call: function() {

            var args = Array.prototype.slice.call(arguments),
                path = args.shift(),
                next = args.shift(),
                method, params, cb;

            while (next) {
                var type = typeof next;
                if (type === 'string' && !method) {
                    method = next.toLowerCase();
                } else if (type === 'function' && !cb) {
                    cb = next;
                } else if (type === 'object' && !params) {
                    params = next;
                } else {
                    VD.log('Invalid argument passed to VD.api(): ' + next);
                    return;
                }
                next = args.shift();
            }

            method = method || 'get';
            params = params || {};

            // remove prefix slash if one is given, as it's already in the base url
            if (path[0] === '/') {
                path = path.substr(1);
            }

            if (VD.Array.indexOf(VD.ApiServer.METHODS, method) < 0) {
                VD.log('Invalid method passed to VD.api(): ' + method);
                return;
            }

            VD.ApiServer.oauthRequest(path, method, params, cb);
        },

        // --------------------------------------------------------------------

        /**
         * Add the oauth parameter, and fire off a request.
         *
         * @access private
         * @param path   {String}   the request path
         * @param method {String}   the http method
         * @param params {Object}   the parameters for the query
         * @param cb     {Function} the callback function to handle the response
         */
        oauthRequest: function(path, method, params, cb) {

            if (VD.getSession) {
                var session = VD.getSession();
                if (session && session.access_token && !params.access_token) {
                    params.access_token = session.access_token;
                }
            }

            if (!params.access_token && VD._accessToken) {
                params.access_token = VD._accessToken;
            }

            VD.Network.connect(path, method, VD.JSON.flatten(params), cb);
        },

    });

    // ------------------------------------------------------------------------

    VD.ApiServer.setUrl();
};

// ----------------------------------------------------------------------------

var init = this.init = exports.init = apimodule_api;
if ( typeof window.document != 'undefined' && typeof XLP == 'undefined' ) {
    init(window.VD);
}


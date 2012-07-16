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
// @provides vd.auth
// @requires vd.prelude
//           vd.qs
//           vd.event
//           vd.json
//           vd.api
//
// ============================================================================

var apimodule_auth = function (VD) {

    /**
     * Authentication, Authorization & Sessions.
     *
     * @class vd
     * @static
     * @access private
     */
    VD.provide('', {

        getLoginStatus: function(cb) {
            if (cb) {
                cb({status: VD._userStatus, session: VD._session});
            }
        },

        // --------------------------------------------------------------------

        getSession: function() {
            if (VD._session && 'expires' in VD._session && VD._session.expires > 0 && new Date().getTime() > VD._session.expires * 1000) {
                VD.Auth.setSession(null, 'notConnected');
            }
            return VD._session;
        },

        // --------------------------------------------------------------------

        login: function(cb, opts) {
          var currentURL = window.location.href;

          //var regexS = "[\\?&]"+"code"+"=([^&#]*)";
          //var regex = new RegExp( regexS );
          //var results = regex.exec( currentURL );
          //if ( results != null ) {
          //  console.log("Error occured during OAuth processus (cycle operation)");
          //  return;
          //}

          if ( typeof window != 'undefined' && typeof window.document != 'undefined' ) {
                // we try to place it at the center of the current window
                var screenX = typeof window.screenX != 'undefined' ? window.screenX : window.screenLeft,
                    screenY = typeof window.screenY != 'undefined' ? window.screenY : window.screenTop,
                    outerWidth = typeof window.outerWidth != 'undefined' ? window.outerWidth : document.documentElement.clientWidth,
                    outerHeight = typeof window.outerHeight != 'undefined' ? window.outerHeight : (document.documentElement.clientHeight - 22), // 22 = IE toolbar height
                    width = 780,
                    height = 450,
                    left = parseInt(screenX + ((outerWidth - width) / 2), 10),
                    top = parseInt(screenY + ((outerHeight - height) / 2.5), 10),
                    features = 'width=' + width + ',height=' + height + ',left=' + left + ',top=' + top;
        
                opts = VD.copy(opts || {}, {
                    client_id: VD._apiKey,
                    response_type: 'token',
                    display: 'popup',
                    scope: '',
                    state: 'vdauth_' + VD.guid()
                });

                var url = VD.Auth.authorizeUrl + '?' + VD.QS.encode(opts);
                url += '&' + VD.QS.encode({ redirect_uri: currentURL });
                url += '&' + VD.QS.encode({ cancel_url: (currentURL + (currentURL.match(/\?/) ? '&' : '?') + 'canceled=true') });
                if (opts.display === 'popup') {
                    console.log("Open popup " + url);
                    var win = window.open(url, 'vdauth', features);
        
                    if (cb) {
                        VD.Auth._active[opts.state] = {cb: cb, win: win};
                        VD.Auth._popupMonitor();
                    }
                } else {
                    if (opts.display == 'popupInside')
                        opts.display = 'popup';
                    window.location.href = url;
                }
        }
      },

      // ----------------------------------------------------------------------

      logout: function(cb, nodeReq) {
            VD.Auth.setSession(null, 'notConnected', nodeReq);
            VD.Cookie.clear(nodeReq);
            if ( cb ) {
                cb();
            }
      },

      // ----------------------------------------------------------------------

      logoutWeb: function(cb, nodeReq, domain) {
            VD.Cookie.clearWeb(nodeReq, domain);
            if ( cb ) {
                cb();
            }
      }

    });

    // ========================================================================

    var config = require('config').get();
    VD.provide('Auth', {

        authorizeUrl: config.api.oauth_uri + config.api.oauth_authorize_path,
        _active: {},
        _receivedSession: null,

        // --------------------------------------------------------------------

        /**
         * Check if session info are present in the URL fragment
         *
         * @access private
         */
        readFragment: function() {
            if ( typeof window != 'undefined' && typeof window.document != 'undefined' && typeof window.location != 'undefined' ) {
                var h = window.location.href.replace('?', '#'), fragment = h.substr(h.lastIndexOf('#') + 1);
                if (fragment.indexOf('access_token=') >= 0 || fragment.indexOf('error=') >= 0) {
                    var session = VD.QS.decode(fragment);
                    if (window.opener && window.opener.VD.Auth.setSession && window.name == 'vdauth' && window.opener.name != 'vdauth') {
                        // Display none helps prevent loading of some stuff
                        document.documentElement.style.display = 'none';
                        window.opener.VD.Auth.recvSession(session);
                    } else if (session && ('state' in session) && session.state.indexOf('vdauth_') == 0) { // Ensure it's our session
                        // The session have been received as fragment, but we can't find a valid opener.
                        // This happen either when the user is redirected to the authorization page or when the agent
                        // doesn't fully support window.open, and replace the current window by the opened one
                        // (i.e.: iPhone fullscreen webapp mode)
                        if ('access_token' in session) {
                            VD.Auth._receivedSession = session;
                        }
                        // Remove the session from the fragment
                        window.location.hash = h.substr(0, h.lastIndexOf('#'));
                    }
                }
            }
        },

        // --------------------------------------------------------------------

        /**
         * Recieve the authorization server response
         *
         * @access private
         * @param session {Object}  the new Session
         */
        recvSession: function(session) {
            if (!session) {
                VD.error('Received invalid session');
            }

            if ('error' in session) {
                VD.error('Received auth error `' + session.error + '\': ' + session.error_description);
            }

            if (!('state' in session)) {
                VD.error("Received a session with not `state' field");
                return;
            }

            if (!(session.state in VD.Auth._active)) {
                VD.error('Received a session from an inactive window');
                return;
            }

            VD.Auth._active[session.state].session = session;
        },

        // --------------------------------------------------------------------

        /**
         * Set a new session value. Invokes all the registered subscribers
         * if needed.
         *
         * @access private
         * @param session {Object}  the new Session
         * @param status  {String}  the new status
         * @return        {Object}  the "response" object
         */
        setSession: function(session, status, nodeReq) {
            // detect special changes before changing the internal session
            var login = !VD._session && session,
                logout = VD._session && !session,
                both = false, // VD._session && session && VD._session.uid != session.uid,
                sessionChange = login || logout || (VD._session && session && VD._session.access_token != session.access_token) || 
                                (VD._session && session && VD._session.expires_in != session.expires_in),
                statusChange = status != VD._userStatus;

            if (session && 'expires_in' in session) {
                // CAVEAT: the expires here will actually only be valid on the client as end-user machines
                //         clock is rarely synced
                session.expires = Math.round(new Date().getTime() / 1000) + parseInt(session.expires_in, 10);
                delete session.expires_in;
            }

            var response = {
                session: session,
                status: status
            };

            VD._session = session;
            VD._userStatus = status;

            if (session && typeof(session.access_token) != 'undefined') {
                VD.access_token = session.access_token;
            }

            // If cookie support is enabled, set the cookie. Cookie support does not
            // rely on events, because we want the cookie to be set _before_ any of the
            // event handlers are fired. Note, this is a _weak_ dependency on Cookie.
            if (sessionChange && VD.Cookie && VD.Cookie.getEnabled()) {
                VD.Cookie.set(session, nodeReq);
            }

            // events
            if (statusChange) {
                VD.Event.fire('auth.statusChange', response);
            }

            if (logout || both) {
                VD.Event.fire('auth.logout', response);
            }

            if (login || both) {
                VD.Event.fire('auth.login', response);
            }

            if (sessionChange) {
                VD.Event.fire('auth.sessionChange', response);
            }

            return response;
        },

        // --------------------------------------------------------------------

        /**
         * Start and manage the window monitor interval. This allows us to invoke
         * the default callback for a window when the user closes the window
         * directly.
         *
         * @access private
         */
        _popupMonitor: function()
        {
            // check all open windows
            for (var id in VD.Auth._active) {

                if ('win' in VD.Auth._active[id]) {
                    try {
                        // found a closed window
                        if (VD.Auth._active[id].win.closed) {
                            delete VD.Auth._active[id].win;
                            VD.Auth.recvSession(
                                                { error: 'access_denied', 
                                                  error_description: 'Client closed the window', 
                                                  state: id
                                                }
                                               );
                        }
                    } catch (e) {
                        // Do nothing
                    }
                }

                if ('session' in VD.Auth._active[id]) {
                    var callInfo = VD.Auth._active[id];
                    delete VD.Auth._active[id];

                    var session = callInfo.session;
                    if ('access_token' in session) {
                        VD.Auth.setSession(session, 'connected');
                    } else {
                        VD.Auth.setSession(null, 'notConnected');
                    }

                    if ('win' in callInfo) {
                        callInfo.win.close();
                    }

                    if ('cb' in callInfo) {
                        callInfo.cb({status: VD._userStatus, session: VD._session});
                    }
                }
            }

            var hasActive = false;
            for (var id in VD.Auth._active) {
                hasActive = true;
                break;
            }
            if (hasActive && !VD.Auth._popupInterval) {
                // start the monitor if needed and it's not already running
                VD.Auth._popupInterval = window.setInterval(VD.Auth._popupMonitor, 100);
            } else if (!hasActive && VD.Auth._popupInterval) {
                // shutdown if we have nothing to monitor but it's running
                window.clearInterval(VD.Auth._popupInterval);
                VD.Auth._popupInterval = null;
            }
        }
    });

    VD.Auth.readFragment();

}

// ----------------------------------------------------------------------------

var init = this.init = exports.init = apimodule_auth;
if ( typeof window.document != 'undefined' && typeof XLP == 'undefined' ) {
    init(window.VD);
}


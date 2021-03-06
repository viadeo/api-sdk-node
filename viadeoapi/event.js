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
// @provides vd.event
// @requires vd.prelude vd.array
//
// ============================================================================

var apimodule_event = function (VD) {

    VD.provide('EventProvider', {

        /**
         * Returns the internal subscriber array that can be directly manipulated by
         * adding/removing things.
         *
         * @access private
         * @return {Object}
         */
        subscribers: function() {
            // this odd looking logic is to allow instances to lazily have a map of
            // their events. if subscribers were an object literal itself, we would
            // have issues with instances sharing the subscribers when its being used
            // in a mixin style.
            if (!this._subscribersMap) {
                this._subscribersMap = {};
            }
            return this._subscribersMap;
        },

        // --------------------------------------------------------------------

        /**
         * Subscribe to a given event name, invoking your callback function whenever
         * the event is fired.
         *
         * For example, suppose you want to get notified whenever the session
         * changes:
         *
         *     VD.Event.subscribe('auth.sessionChange', function(response) {
         *       // do something with response.session
         *     });
         *
         * Global Events:
         *
         * - auth.login -- fired when the user logs in
         * - auth.logout -- fired when the user logs out
         * - auth.sessionChange -- fired when the session changes
         * - auth.statusChange -- fired when the status changes
         *
         * @access public
         * @param name {String} Name of the event.
         * @param cb {Function} The handler function.
         */
        subscribe: function(name, cb) {
            var subs = this.subscribers();

            if (!subs[name]) {
                subs[name] = [cb];
            } else {
                subs[name].push(cb);
            }
        },

        // --------------------------------------------------------------------

        /**
         * Removes subscribers, inverse of [VD.Event.subscribe](VD.Event.subscribe).
         *
         * Removing a subscriber is basically the same as adding one. You need to
         * pass the same event name and function to unsubscribe that you passed into
         * subscribe. If we use a similar example to
         * [VD.Event.subscribe](VD.event.subscribe), we get:
         *
         *     var onSessionChange = function(response) {
         *       // do something with response.session
         *     };
         *     VD.Event.subscribe('auth.sessionChange', onSessionChange);
         *
         *     // sometime later in your code you dont want to get notified anymore
         *     VD.Event.unsubscribe('auth.sessionChange', onSessionChange);
         *
         * @access public
         * @param name {String} Name of the event.
         * @param cb {Function} The handler function.
         */
        unsubscribe: function(name, cb) {
            var subs = this.subscribers()[name];

            VD.Array.forEach(subs, function(value, key) {
                if (value == cb) {
                    subs[key] = null;
                }
            });
        },

        // --------------------------------------------------------------------

        /**
         * Repeatedly listen for an event over time. The callback is invoked
         * immediately when monitor is called, and then every time the event
         * fires. The subscription is canceled when the callback returns true.
         *
         * @access private
         * @param {string} name Name of event.
         * @param {function} callback A callback function. Any additional arguments
         * to monitor() will be passed on to the callback. When the callback returns
         * true, the monitoring will cease.
         */
        monitor: function(name, callback) {
            if (!callback()) {
                var ctx = this,
                    fn = function() {
                        if (callback.apply(callback, arguments)) {
                            ctx.unsubscribe(name, fn);
                        }
                    };

                this.subscribe(name, fn);
            }
        },

        // --------------------------------------------------------------------

        /**
         * Removes all subscribers for named event.
         *
         * You need to pass the same event name that was passed to VD.Event.subscribe.
         * This is useful if the event is no longer worth listening to and you
         * believe that multiple subscribers have been set up.
         *
         * @access private
         * @param name    {String}   name of the event
         */
        clear: function(name) {
            delete this.subscribers()[name];
        },

        // --------------------------------------------------------------------

        /**
         * Fires a named event. The first argument is the name, the rest of the
         * arguments are passed to the subscribers.
         *
         * @access private
         * @param name {String} the event name
         */
        fire: function() {
            var args = Array.prototype.slice.call(arguments),
                name = args.shift();

            VD.Array.forEach(this.subscribers()[name], function(sub) {
                // this is because we sometimes null out unsubscribed rather than jiggle
                // the array
                if (sub) {
                    sub.apply(this, args);
                }
            });
        }
    });

    // ------------------------------------------------------------------------

    /**
     * Event handling mechanism for globally named events.
     *
     * @class VD.Event
     * @extends VD.EventProvider
     */
    VD.provide('Event', VD.EventProvider);

};

// ----------------------------------------------------------------------------

var init = this.init = exports.init = apimodule_event;
if ( typeof window.document != 'undefined' && typeof XLP == 'undefined' ) {
    init(window.VD);
}


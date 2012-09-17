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
// ============================================================================

var apimodule_network = function (VD) {

    // Network compatibility switchs ==============================================
    if ( typeof window.document != 'undefined' ) { // In browser

        console.log('NETWORK IN BROWSER');
        VD.provide('Network', {
            connect: function(path, method, params, cb) {
                var g = VD.guid(), script = document.createElement('script');
        
                // jsonp needs method overrides as the request itself is always a GET
                if (method && method != 'get' && method != 'GET') {
                  params.method = method;
                }
                params.jsonp = 'VD.ApiServer._callbacks.' + g;
        
                var url = (VD.ApiServer.endpoint + path + (path.indexOf('?') > -1 ? '&' : '?') + VD.QS.encode(params));
                if (url.length > 2000) {
                    throw new Error('JSONP only support a maximum of 2000 bytes of input.');
                }
        
                // this is the JSONP callback invoked by the response
        
                VD.ApiServer._callbacks[g] = function(response) {
                    cb && cb(response);
                    delete VD.ApiServer._callbacks[g];
                    script.src = null;
                    script.parentNode.removeChild(script);
                };
        
                script.src = url;
                document.getElementsByTagName('head')[0].appendChild(script);
            }
        }); 

    } else { // Node.JS ===========================================================
        
        var log4js     = require('log4js');
        var logger     = log4js.getLogger('api/network');
        var dataLogger = log4js.getLogger('api/network/data');

        console.log('NETWORK IN NODE');
        VD.provide('Network', {
            connect: function(path, method, params, cb) {
                var g = VD.guid();
                var http = (VD.ApiServer.proto == 'https') ? require('https') : require('http');

                var getError = function(type, msg) {
                    return { error: { type: type, message: [ msg ] } };
                }

                // Prepare request ------------------------------------------------
                if (method) {
                    method = method.toUpperCase();
                }

                if (method && method == 'GET') {
                    params.method = null;
                }

                var dataParams = VD.QS.encode(params);
                if ( ! ( method && ( (method == 'POST') || (method == 'PUT') ) ) ) {
                    path = '/' + path + (path.indexOf('?') > -1 ? '&' : '?') + dataParams; 
                } else {
                    // FIXME: Temp hack because of an API bug: access_token must be in url
                    path = '/' + path + (path.indexOf('?') > -1 ? '&' : '?') + 'access_token=' + params['access_token'];
                    params['access_token'] = null;
                    dataParams = VD.QS.encode(params);
                }

                var options = {
                  host: VD.ApiServer.host,
                  port: VD.ApiServer.port,
                  path: path,
                  method: method
                };
                dataLogger.debug('API '+g+' CONNECT : \'', options);

                for (var param in params) {
                    var str = params[param];
                    if (str) {
                        str = str.toString();
                        dataLogger.debug("API ' +g +' PARAM : '" + param + "': " + str.substring(0, 50) + ((str.length > 50) ? "..." : ""));
                    }
                }

                if (method && ((method == 'POST') || (method == 'PUT'))) {
                    options.headers = {
                      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                      'Content-Length': dataParams.length
                    }
                }

                // Launch request -------------------------------------------------
                logger.debug('API '+g+': ' + path);
                var req = http.request(options);
                if (method && ((method == 'POST') || (method == 'PUT'))) {
                    req.write(dataParams);
                }
                req.end();
                logger.debug('API '+g+': REQUEST SENT');

                // Response handler -----------------------------------------------
                req.on('response', function(res) {
                  logger.debug('API '+g+': RESPONSE RECEIVED');
                  var body = '';

                  var codeFamily = parseInt(res.statusCode / 100) * 100;
                  logger.debug('API '+g+': statusCode: ', res.statusCode);
                  dataLogger.debug('API '+g+': headers: ', res.headers);

                  // Buffer chunks ------------------------------------------------
                  res.on('data', function (d) {
                    body += d;
                  });

                  // End of buffering ---------------------------------------------
                  res.on('end', function () {
                    logger.debug('API '+g+': REQUEST ENDED');
                    if (cb) {

                        try {
                            body = JSON.parse(body);
                        } catch (e) {
                            logger.error('API '+g+': JSON parse error: '+e);
						    logger.error(body);
                            body = { data: body };
                        }

//                        dataLogger.debug('API '+g+' BODY: ', body);
                        logger.debug(codeFamily);

                        if (codeFamily != 200) {
                            if (body) {
                                cb(body, res.statusCode);
                            } else {
                                cb(getError('API Error', e), res.statusCode);
                            }
                        } else {
                            cb(body, res.statusCode);
                        }

                      }
                  });
                  
                  // Hack: ensure connection closing ------------------------------
                  res.on('close', function () { res.emit('end') });                  
                });

                // Error handler --------------------------------------------------
                req.on('error', function(e) {
                  console.error('HTTP error: '+e);
                  cb(getError('Connection Error', e));
                });
        
            }
        });

    }

};

// ----------------------------------------------------------------------------

var init = this.init = exports.init = apimodule_network;
if ( typeof window.document != 'undefined' && typeof XLP == 'undefined' ) {
    init(window.VD);
}


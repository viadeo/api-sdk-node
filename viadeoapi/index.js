// ============================================================================
// VIADEO GRAPH API CONNECTOR -- NODE.JS FRAMEWORK FOR A BETTER WORLD WITH APIs
//                   XLP - eXecution and Loading Planner
// ============================================================================
//             www.viadeo.com - api.video.com - dev.viadeo.com
//
//             Copyright (C) Viadeo 2011 - All rights reserved
// ============================================================================

// Compatibility trick for library loading ------------------------------------
var G;
try {
	G = require('G');
} catch (e) {
	G = { load: function() {} };
}

// ----------------------------------------------------------------------------

exports.uses     = G.load([
    'viadeoapi/prelude',
    'viadeoapi/event',
    'viadeoapi/qs',
    'viadeoapi/auth',
    'viadeoapi/init',
    'viadeoapi/cookie',
    'viadeoapi/array',
    'viadeoapi/json',
    'viadeoapi/network',
    'viadeoapi/api'
]);

// ----------------------------------------------------------------------------

function xlp_api_clone(srcInstance) {
    if(typeof(srcInstance) != 'object' || srcInstance == null) {
        return srcInstance;
    }
    var newInstance = srcInstance.constructor();
    for(var i in srcInstance) {
        newInstance[i] = xlp_api_clone(srcInstance[i]);
    }
    return newInstance;
}

// ----------------------------------------------------------------------------

VD = {};

require('viadeoapi/prelude').init(VD);
require('viadeoapi/event').init(VD);
require('viadeoapi/qs').init(VD);
require('viadeoapi/auth').init(VD);
require('viadeoapi/init').init(VD);
require('viadeoapi/cookie').init(VD);

require('viadeoapi/array').init(VD);
require('viadeoapi/json').init(VD);
require('viadeoapi/network').init(VD);
require('viadeoapi/api').init(VD);

// ----------------------------------------------------------------------------

this.getInstance = exports.getInstance = function () {

    var newVD = xlp_api_clone(VD);
    VD = newVD;

    return newVD;
}

// ----------------------------------------------------------------------------

this.instance = exports.instance = function() {
    if ( ! VD ) {
        this.getInstance();
    }
    return VD;
}


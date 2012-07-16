// ============================================================================
// VIADEO GRAPH API CONNECTOR -- NODE.JS FRAMEWORK FOR A BETTER WORLD WITH APIs
//                   XLP - eXecution and Loading Planner
// ============================================================================
//             www.viadeo.com - api.video.com - dev.viadeo.com
//
//             Copyright (C) Viadeo 2011 - All rights reserved
// ============================================================================
//
// - Main dispatcher access script - Application HEAD
//
// @author Loïc Dias Da Silva <ldiasdasilva@viadeoteam.com> 
// ============================================================================

var VD = require('viadeoapi').getInstance();

VD.init({
    access_token: '<enter test access token>'
});

VD.api('/me', function(response) {
    console.log('Hello ' + response.name);
});

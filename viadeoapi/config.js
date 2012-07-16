// ============================================================================
// VIADEO GRAPH API CONNECTOR -- NODE.JS FRAMEWORK FOR A BETTER WORLD WITH APIs
//                   XLP - eXecution and Loading Planner
// ============================================================================
//             www.viadeo.com - api.video.com - dev.viadeo.com
//
//             Copyright (C) Viadeo 2011 - All rights reserved
// ============================================================================
// - Configuration for standalone library usage
// ============================================================================

var VD_CONFIG = module.exports = {
    get: function() { 
        return {
            api: {
                oauth_uri: 'https://secure.viadeo.com',
                oauth_token_path: '/oauth-provider/token',
                oauth_authorize_path: '/oauth-provider/authorize2',
                api_uri: 'https://api.viadeo.com/',
            },
        } 
    }
}

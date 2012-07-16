// ============================================================================
// VIADEO GRAPH API CONNECTOR -- NODE.JS FRAMEWORK FOR A BETTER WORLD WITH APIs
//                   XLP - eXecution and Loading Planner
// ============================================================================
//             www.viadeo.com - api.video.com - dev.viadeo.com
//
//             Copyright (C) Viadeo 2011 - All rights reserved
// ============================================================================
// - Compatibility Node.JS / Standalone JS
// ============================================================================

var require = require;
if ( ! require ) {
    require = function(path) {
        if (path == 'viadeoapi') {
            return { VD: VD };
        }
        if (path == 'config') {
            return VD_CONFIG;
        }
    }
}

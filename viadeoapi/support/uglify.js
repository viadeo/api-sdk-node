// ============================================================================
// VIADEO GRAPH API CONNECTOR -- NODE.JS FRAMEWORK FOR A BETTER WORLD WITH APIs
//                   XLP - eXecution and Loading Planner
// ============================================================================
//             www.viadeo.com - api.video.com - dev.viadeo.com
//
//             Copyright (C) Viadeo 2011 - All rights reserved
// ============================================================================
//
// - Uglify-JS helper
//
// @author Loïc Dias Da Silva <ldiasdasilva@viadeoteam.com> 
// ============================================================================

var uglify = require("uglify-js");
var jsp = uglify.parser;
var pro = uglify.uglify;

/*
** Uglify some valid Javascript code
**
** @param code The Javascript to uglify
*/
exports.do = function(code) {
    var origCode = code;
    try {

        var ast = jsp.parse(code);
        ast = pro.ast_mangle(ast);
        ast = pro.ast_squeeze(ast);
        code = pro.gen_code(ast) + ';';

    } catch (e) {
        console.error('Uglify ERROR: '+e);
        code = origCode;
    }
    return code;
}

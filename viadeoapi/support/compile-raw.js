var files = require('../_require');

// Load all specified files -------------------------------------------
var data = "";
for (var i = 0; i < files.length; i++) {
    var file = files[i];
    data += require('fs').readFileSync(file, 'UTF-8');
}
console.log(data);

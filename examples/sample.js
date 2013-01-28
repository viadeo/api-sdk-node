var querystring = require('querystring');
var Viadeo = require('..');

// Request an API Key here: http://dev.viadeo.com/documentation/authentication/request-an-api-key/
var viadeo = new Viadeo({
	clientId: '',
	clientSecret: '',
	accessToken: ''
});

// API documentation: http://dev.viadeo.com/documentation

// Using the raw query
viadeo.query('/me', 'GET', {
	connections: 'company'
}, function(data) {
	console.log(data.name + ' works at ' + data.current_company.current_company.name + '.');
});

// Using the user helper
viadeo.user.getContacts({}, function(data) {
	console.log(data.name + ' has ' + data.count + ' contacts.');
});
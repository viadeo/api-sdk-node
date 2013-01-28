/**
 * Viadeo API
 * Resource: /user
 * Documentation: http://dev.viadeo.com/graph-api-resource/?resource=/recommend
 */

/**
* Get the current user's profile
* @param {Object}   params   Parameters of the request
* @param {Function} callback Function to execute at the end of the request. Passed the response of the request and the response code
* @return {Viadeo}           Viadeo instance
*/
function getProfile(params, callback) {
	this.query('/me', 'GET', params, ['/me' + this.options.accessToken], callback);
	return this;
}

/**
* Update the current user's profile
* @param {Object}   params   Parameters of the request
* @param {Function} callback Function to execute at the end of the request. Passed the response of the request and the response code
* @return {Viadeo}           Viadeo instance
*/
function setProfile(params, callback) {
	this.query('/me', 'PUT', params, function() {

		// Invalidate the cache of the user's profile
		uncacheProfile(params);

		// Execute the callback
		if (callback) callback.apply(this, arguments);

	}.bind(this));
	return this;
}

/**
* Get the current user's contacts
* @param {Object}   params   Parameters of the request
* @param {Function} callback Function to execute at the end of the request. Passed the response of the request and the response code
* @return {Viadeo}           Viadeo instance
*/
function getContacts(params, callback) {
	this.query('/me/contacts', 'GET', params, ['/me' + this.options.accessToken], callback);
	return this;
}

/**
* Invalidate the cache of the current user's profile
* @param {Object}   params   Parameters of the request
* @param {Function} callback Function to execute at the end of the request. Passed the response of the request and the response code
* @return {Viadeo}           Viadeo instance
*/
function uncacheProfile(params, callback) {
	// Invalidate the cache of the user's profile if memcache is enabled
	if (this.options.memcache) {
		this.options.memcache.delByTag('/me' + this.options.accessToken, function(err, res){
			if (err) console.error(err);
			else console.info('Uncached the "/me' + this.options.accessToken + '" tag');
		}.bind(this));
	}

	// Execute the callback
	if (callback) callback.apply(this, arguments);

	return this;
}

module.exports = function(Viadeo) {
	return {
		getProfile: getProfile.bind(Viadeo),
		setProfile: setProfile.bind(Viadeo),
		getContacts: getContacts.bind(Viadeo),
		uncacheProfile: uncacheProfile.bind(Viadeo)
	};
};
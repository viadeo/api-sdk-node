/**
 * Viadeo API
 * Resource: /recommend
 * Documentation: http://dev.viadeo.com/graph-api-resource/?resource=/recommend
 */

/**
* Get the recommendation informations about a page (and the user if an access token is provided)
* @param {Object}   params   Parameters of the request
* @param {Function} callback Function to execute at the end of the request. Passed the response of the request and the response code
* @return {Viadeo}           Viadeo instance
*/
function get(params, callback) {
	this.query('/recommend', 'GET', params, ['/recommend' + params.url], callback);
	return this;
}

/**
* Recommend the page
* @param {Object}   params   Parameters of the request
* @param {Function} callback Function to execute at the end of the request. Passed the response of the request and the response code
* @return {Viadeo}           Viadeo instance
*/
function set(params, callback) {
	this.query('/recommend', 'POST', params, function() {

		// Invalidate the cache of the page informations
		if (this.options.memcache) {
			this.options.memcache.delByTag('/recommend' + params.url, function(err, res){
				if (err) console.error(err);
				else console.info('Uncached the "/recommend' + params.url + '" tag');
			});
		}
		callback.apply(this, arguments);

	}.bind(this));
	return this;
}

module.exports = function(Viadeo) {
	return {
		get: get.bind(Viadeo),
		set: set.bind(Viadeo)
	};
};
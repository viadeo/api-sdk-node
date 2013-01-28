/**
 * Viadeo API
 * @author Viadeo - http://dev.viadeo.com
 */

var
	crypto = require('crypto'),
	querystring = require('querystring'),
	sys = require('sys'),
	events = require('events'),
	domain = require('domain'),
	request = require('request')
;

/**
 * Constructor
 * @param  {object} options Options of the Viadeo object
 * @return {Viadeo}         Viadeo object
 */
var Viadeo = function(options) {
	this.vd = domain.create();
	events.EventEmitter.call(this);

	var prop;

	// Default options
	this.options = {
		api: {
			url: 'api.viadeo.com',
			secure: true
		},
		oauth: {
			url: 'secure.viadeo.com',
			secure: true,
			authorize: '/oauth-provider/authorize2',
			token: '/oauth-provider/token'
		},
		clientId: '',
		clientSecret: '',
		accessToken: '',
		memcache: false,
		memcacheTimeout: 10000
	};

	// Override the default options by the user's one TODO: use utils._extend instead
	for (prop in options) this.options[prop] = options[prop];

	/**
	 * Raw query to the API, with caching if memcache is enabled
	 * @param  {string}   path     The API path to query
	 * @param  {string}   method   The method to use for the query (optional, default to GET). Possible values: GET, POST, PUT, DELETE
	 * @param  {object}   params   Parameters of the request
	 * @param  {array}    tags     Tags, useful for memcacher to uncache some data (optional, default to [])
	 * @param  {function} callback Function to execute at the end of the request. Passed the response of the request and the response code (optional, default to null)
	 * @return {Viadeo}            Viadeo object
	 */
	this.query = function() {
		var
			path = arguments[0],
			method =
				typeof(arguments[1]) == 'string' ? arguments[1].toUpperCase() :
				'GET',
			params =
				typeof arguments[2] === 'object' ? arguments[2] :
				typeof arguments[1] === 'object' ? arguments[1] :
				{},
			tags =
				arguments[3] instanceof Array ? arguments[3] :
				arguments[2] instanceof Array ? arguments[2] :
				arguments[1] instanceof Array ? arguments[1] :
				[],
			callback =
				typeof arguments[4] === 'function' ? arguments[4] :
				typeof arguments[3] === 'function' ? arguments[3] :
				typeof arguments[2] === 'function' ? arguments[2] :
				typeof arguments[1] === 'function' ? arguments[1] :
				null,
			apiRes, timerStart, time
		;

		params.access_token = this.options.accessToken;

		var
			// Request object
			apiReq = {
				// Calculate the hash
				hash: crypto
						.createHash('sha1')
						.update(path + JSON.stringify(params))
						.digest('hex'),
				path: path,
				method: method,
				params: params
			},

			// Ask the cache for data
			cacheCall = function() {
				this.emit('cacheReadStart', apiReq);
				timerStart = process.hrtime();
				this.options.memcache.get(apiReq.hash, function(err, data) {
					if (err) return this.emit('error', err);

					// Emit the cacheReadEnd event
					time = process.hrtime(timerStart);
					this.emit('cacheReadEnd', apiReq, {
						code: 200,
						data: data,
						time: Math.round(time[0] * 1e3 + time[1] / 1e6), // Because returning a int is too mainstream
						cache: true
					});

					// If not found, call the API
					if (!data) return apiCall(true);

					if (callback) callback(data, 200);
				}.bind(this));
				return this;
			}.bind(this),

			// Ask the API for data
			apiCall = function(cacheResults) {
				this.emit('queryStart', apiReq);
				timerStart = process.hrtime();

				// TODO: We should use the Streams instead
				request({
					url: 'http' + (this.options.api.secure ? 's' : '') + '://' + this.options.api.url + path,
					qs: params,
					method: method,
					timeout: 30 * 1e3,
					encoding: 'UTF-8'
				}, function (err, res, data) {
					if (err) return this.emit('error', err);

					// Parse the JSON response
					try {
						data = JSON.parse(data);
					} catch(e) {
						this.emit('error', e);
					}

					// Emit the queryEnd event
					time = process.hrtime(timerStart);
					this.emit('queryEnd', apiReq, {
						code: res.statusCode,
						data: data,
						time: Math.round(time[0] * 1e3 + time[1] / 1e6), // Because returning a int is too mainstream
						cache: false
					});

					// Cache the results
					if (cacheResults && res.statusCode === 200) {
						this.emit('cacheWriteStart', apiReq);
						timerStart = process.hrtime();
						this.options.memcache.set({
							key: apiReq.hash,
							value: data,
							expireIn: this.options.memcacheTimeout,
							tags: tags
						}, function(err, cacheRes){
							if (err) return this.emit('error', err);
							time = process.hrtime(timerStart);
							this.emit('cacheWriteEnd', apiReq, {
								code: res.statusCode,
								data: data,
								time: Math.round(time[0] * 1e3 + time[1] / 1e6), // Because returning a int is too mainstream
								cache: {
									expire: this.options.memcacheTimeout,
									tags: tags
								}
							});
						}.bind(this));
					}

					if (callback) return callback(data, res.statusCode);

				}.bind(this));
				return this;
			}.bind(this)
		;

		// Directly call the API
		if (this.options.memcache === false || method !== 'GET') return apiCall(false);

		// Search in memcache before the API request
		return cacheCall();

	};

	// Specific methods
	this.recommend = require(__dirname + '/lib/recommend')(this);
	this.user = require(__dirname + '/lib/user')(this);

	return this;
};
sys.inherits(Viadeo, events.EventEmitter);

module.exports = Viadeo;
'use strict';

const qs = require('querystring');
const {OAuth} = require('oauth');
const FanfouError = require('./ff-error');

Object.assign(OAuth.prototype, {
	getXAuthAccessToken(username, password, callback) {
		const xauthParams = {
			x_auth_mode: 'client_auth',
			x_auth_password: password,
			x_auth_username: username
		};

		this._performSecureRequest(null, null, this._clientOptions.accessTokenHttpMethod, this._accessUrl, xauthParams, null, null, (error, data, response) => {
			if (error) {
				if (response) {
					response.body = data;
					callback(new FanfouError(response));
				} else {
					callback(error);
				}
			} else {
				const results = qs.parse(data);
				const oauthAccessToken = results.oauth_token;
				delete results.oauth_token;
				const oauthAccessTokenSecret = results.oauth_token_secret;
				delete results.oauth_token_secret;
				callback(null, oauthAccessToken, oauthAccessTokenSecret, results);
			}
		});
	}
});

Object.assign(OAuth.prototype, {
	_getSignature(method, url, parameters, tokenSecret) {
		let signatureBase = this._createSignatureBase(method, url, parameters);
		if (this.hooks.baseString) {
			signatureBase = this.hooks.baseString(signatureBase);
		}
		return this._createSignature(signatureBase, tokenSecret);
	}
});

module.exports = OAuth;

'use strict';

const qs = require('querystring');
const request = require('request');
const oauthSignature = require('oauth-signature');

const User = require('./user');
const OAuth = require('./oauth');
const {isJson} = require('./util');
const Status = require('./status');
const FanfouError = require('./ff-error');
const DirectMessage = require('./direct-message');

class Fanfou {
	constructor(options) {
		options = options || {};

		// Required
		this.consumerKey = options.consumerKey;
		this.consumerSecret = options.consumerSecret;

		// Optional
		this.protocol = options.protocol || 'http:';
		this.oauthDomain = options.oauthDomain || 'fanfou.com';
		this.apiDomain = options.apiDomain || 'api.fanfou.com';
		this.hooks = options.hooks || {};

		// OAuth required
		this.oauthToken = options.oauthToken || '';
		this.oauthTokenSecret = options.oauthTokenSecret || '';

		// XAuth required
		this.username = options.username || '';
		this.password = options.password || '';

		this.oauth = new OAuth(
			`${this.protocol}//${this.oauthDomain}/oauth/request_token`,
			`${this.protocol}//${this.oauthDomain}/oauth/access_token`,
			this.consumerKey,
			this.consumerSecret,
			'1.0',
			null,
			'HMAC-SHA1'
		);

		this.oauth.hooks = this.hooks;
	}

	xauth() {
		return new Promise((resolve, reject) => {
			this.oauth.getXAuthAccessToken(this.username, this.password, (err, oauthToken, oauthTokenSecret) => {
				if (err) {
					reject(err);
				} else {
					this.oauthToken = oauthToken;
					this.oauthTokenSecret = oauthTokenSecret;
					resolve({oauthToken, oauthTokenSecret});
				}
			});
		});
	}

	get(uri, parameters) {
		const url = this.protocol + '//' + this.apiDomain + uri + '.json';
		return new Promise((resolve, reject) => {
			this.oauth.get(
				url + '?' + qs.stringify(parameters),
				this.oauthToken,
				this.oauthTokenSecret,
				(err, rawData, httpResponse) => {
					if (err) {
						if (httpResponse && rawData) {
							httpResponse.body = rawData;
							reject(new FanfouError(httpResponse));
						} else {
							reject(err);
						}
					} else if (typeof rawData === 'string' && isJson(rawData.trim())) {
						const data = JSON.parse(rawData);
						if (data.error) {
							resolve(data);
						} else {
							const result = Fanfou._parseData(data, Fanfou._uriType(uri));
							resolve(result);
						}
					} else {
						reject(new Error('Invalid body'));
					}
				}
			);
		});
	}

	post(uri, parameters) {
		const url = this.protocol + '//' + this.apiDomain + uri + '.json';
		return new Promise((resolve, reject) => {
			this.oauth.post(
				url,
				this.oauthToken,
				this.oauthTokenSecret,
				parameters,
				(err, rawData, httpResponse) => {
					if (err) {
						if (httpResponse && rawData) {
							httpResponse.body = rawData;
							reject(new FanfouError(httpResponse));
						} else {
							reject(err);
						}
					} else if (typeof rawData === 'string' && isJson(rawData.trim())) {
						const data = JSON.parse(rawData);
						if (data.error) {
							resolve(data);
						} else {
							const result = Fanfou._parseData(data, Fanfou._uriType(uri));
							resolve(result);
						}
					} else {
						reject(new Error('Invalid body'));
					}
				}
			);
		});
	}

	upload(uri, parameters) {
		const method = 'POST';
		const url = this.protocol + '//' + this.apiDomain + uri + '.json';
		const params = {
			oauth_consumer_key: this.consumerKey,
			oauth_token: this.oauthToken,
			oauth_signature_method: 'HMAC-SHA1',
			oauth_timestamp: Math.floor(Date.now() / 1000),
			oauth_nonce: this.oauth._getNonce(6),
			oauth_version: '1.0'
		};
		const signature = oauthSignature.generate(
			method,
			this.fakeHttps ? url.replace('https', 'http') : url,
			params,
			this.consumerSecret,
			this.oauthTokenSecret,
			{encodeSignature: false}
		);
		const authorizationHeader = this.oauth._buildAuthorizationHeaders(
			this.oauth._sortRequestParams(
				this.oauth._makeArrayOfArgumentsHash(params)
			).concat([['oauth_signature', signature]])
		);
		return new Promise((resolve, reject) => {
			request.post({
				url,
				formData: parameters,
				headers: {Authorization: authorizationHeader}
			}, (err, httpResponse, body) => {
				if (err) {
					reject(err);
				} else if (httpResponse.statusCode !== 200) {
					reject(new FanfouError(httpResponse));
				} else if (typeof body === 'string' && isJson(body.trim())) {
					const data = JSON.parse(body);
					if (data.error) {
						resolve(data);
					} else {
						const result = Fanfou._parseData(data, Fanfou._uriType(uri));
						resolve(result);
					}
				} else {
					reject(new Error('invalid body'));
				}
			});
		});
	}

	static _uriType(uri) {
		const uriList = {
			// Timeline
			'/search/public_timeline': 'timeline',
			'/search/user_timeline': 'timeline',
			'/photos/user_timeline': 'timeline',
			'/statuses/friends_timeine': 'timeline',
			'/statuses/home_timeline': 'timeline',
			'/statuses/public_timeline': 'timeline',
			'/statuses/replies': 'timeline',
			'/statuses/user_timeline': 'timeline',
			'/statuses/context_timeline': 'timeline',
			'/statuses/mentions': 'timeline',
			'/favorites': 'timeline',

			// Status
			'/statuses/update': 'status',
			'/statuses/show': 'status',
			'/favorites/destroy': 'status',
			'/favorites/create': 'status',
			'/photos/upload': 'status',

			// Users
			'/users/tagged': 'users',
			'/users/followers': 'users',
			'/users/friends': 'users',
			'/friendships/requests': 'users',

			// User
			'/users/show': 'user',
			'/friendships/create': 'user',
			'/friendships/destroy': 'user',
			'/account/verify_credentials': 'user',

			// Conversation
			'/direct_messages/conversation': 'conversation',
			'/direct_messages/inbox': 'conversation',
			'/direct_messages/sent': 'conversation',

			// Conversation List
			'/direct_messages/conversation_list': 'conversation-list',

			// Direct Message
			'/direct_messages/new': 'dm',
			'/direct_messages/destroy': 'dm'

		};
		return uriList[uri] || null;
	}

	static _parseList(data, type) {
		const arr = [];
		for (const i in data) {
			if (data[i]) {
				switch (type) {
					case 'timeline':
						arr.push(new Status(data[i]));
						break;
					case 'users':
						arr.push(new User(data[i]));
						break;
					case 'conversation':
						arr.push(new DirectMessage(data[i]));
						break;
					case 'conversation-list':
						data[i].dm = new DirectMessage(data[i].dm);
						arr.push(data[i]);
						break;
					default:
						break;
				}
			}
		}
		return arr;
	}

	static _parseData(data, type) {
		switch (type) {
			case 'timeline':
			case 'users':
			case 'conversation':
			case 'conversation-list':
				return Fanfou._parseList(data, type);
			case 'status':
				return new Status(data);
			case 'user':
				return new User(data);
			case 'dm':
				return new DirectMessage(data);
			default:
				return data;
		}
	}
}

module.exports = Fanfou;

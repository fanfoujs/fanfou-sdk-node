'use strict';

const got = require('got');
const hmacsha1 = require('hmacsha1');
const oauth = require('oauth-1.0a');
const queryString = require('query-string');
const FormData = require('form-data');

const User = require('./user');
const Status = require('./status');
const DirectMessage = require('./direct-message');
const FanfouError = require('./ff-error');

class Fanfou {
	constructor(opt = {}) {
		({
			consumerKey: this.consumerKey = '',
			consumerSecret: this.consumerSecret = '',
			oauthToken: this.oauthToken = '',
			oauthTokenSecret: this.oauthTokenSecret = '',
			username: this.username = '',
			password: this.password = '',
			protocol: this.protocol = 'http:',
			apiDomain: this.apiDomain = 'api.fanfou.com',
			oauthDomain: this.oauthDomain = 'fanfou.com',
			hooks: this.hooks = {}
		} = opt);
		this.oauthInit();
		this.apiInit();
	}

	oauthInit() {
		this.o = oauth({
			consumer: {key: this.consumerKey, secret: this.consumerSecret},
			signature_method: 'HMAC-SHA1',
			parameter_seperator: ',',
			hash_function: (baseString, key) => {
				const {baseString: baseStringHook} = this.hooks;
				if (baseStringHook) {
					baseString = baseStringHook(baseString);
				}

				return hmacsha1(key, baseString);
			}
		});
		return this;
	}

	apiInit() {
		this.apiEndPoint = `${this.protocol}//${this.apiDomain}`;
		this.oauthEndPoint = `${this.protocol}//${this.oauthDomain}`;
		return this;
	}

	async xauth() {
		const url = `${this.oauthEndPoint}/oauth/access_token`;
		const params = {
			x_auth_mode: 'client_auth',
			x_auth_password: this.password,
			x_auth_username: this.username
		};
		const {Authorization} = this.o.toHeader(this.o.authorize({url, method: 'POST'}));
		try {
			const response = await got.post(url, {
				headers: {
					Authorization,
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: queryString.stringify(params)
			});
			const {body} = response;
			const result = queryString.parse(body);
			({oauth_token: this.oauthToken, oauth_token_secret: this.oauthTokenSecret} = result);
			return this;
		} catch (error) {
			throw new FanfouError(error);
		}
	}

	async get(uri, params) {
		const query = queryString.stringify(params);
		const url = `${this.apiEndPoint}${uri}.json${query ? `?${query}` : ''}`;
		const token = {key: this.oauthToken, secret: this.oauthTokenSecret};
		const {Authorization} = this.o.toHeader(this.o.authorize({url, method: 'GET'}, token));
		try {
			const {body} = await got.get(url, {
				headers: {
					Authorization,
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			});
			const res = JSON.parse(body);
			const result = Fanfou._parseData(res, Fanfou._uriType(uri));
			return result;
		} catch (error) {
			throw new FanfouError(error);
		}
	}

	async post(uri, params) {
		const url = `${this.apiEndPoint}${uri}.json`;
		const token = {key: this.oauthToken, secret: this.oauthTokenSecret};
		const isUpload = ['/photos/upload', '/account/update_profile_image'].includes(uri);
		const {Authorization} = this.o.toHeader(this.o.authorize({url, method: 'POST', data: isUpload ? null : params}, token));
		let form = null;
		const headers = {Authorization, 'Content-Type': 'application/x-www-form-urlencoded'};
		if (isUpload) {
			form = new FormData();
			Object.keys(params).forEach(key => {
				form.append(key, params[key]);
			});
			delete headers['Content-Type'];
		}

		try {
			const {body} = await got.post(url, {
				headers,
				body: isUpload ? form : queryString.stringify(params)
			});
			const res = JSON.parse(body);
			const result = Fanfou._parseData(res, Fanfou._uriType(uri));
			return result;
		} catch (error) {
			throw new FanfouError(error);
		}
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

		const type = uriList[uri] || null;
		if (!type && /^\/favorites\/(create|destroy)\/.+/.test(uri)) {
			return 'status';
		}

		return type;
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

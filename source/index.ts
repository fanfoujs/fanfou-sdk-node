import got from 'got';
// @ts-expect-error
import hmacsha1 from 'hmacsha1';
import OAuth from 'oauth-1.0a';
import queryString from 'query-string';
import FormData from 'form-data';
import User from './user.js';
import Status from './status.js';
import DirectMessage from './direct-message.js';
import FanfouError from './ff-error.js';

type Token = {
	oauthToken: string;
	oauthTokenSecret: string;
};

type Hooks = {
	baseString?: (s: string) => string;
};

type FanfouOptions = {
	consumerKey?: string;
	consumerSecret?: string;
	oauthToken?: string;
	oauthTokenSecret?: string;
	username?: string;
	password?: string;
	protocol?: string;
	apiDomain?: string;
	oauthDomain?: string;
	hooks?: Hooks;
};

class Fanfou {
	consumerKey: string;
	consumerSecret: string;
	oauthToken: string;
	oauthTokenSecret: string;
	username: string;
	password: string;
	protocol: string;
	apiDomain: string;
	oauthDomain: string;
	// @ts-expect-error
	apiEndPoint: string;
	// @ts-expect-error
	oauthEndPoint: string;
	// @ts-expect-error
	o: OAuth;
	hooks: Hooks;

	constructor(opt: FanfouOptions = {}) {
		this.consumerKey = opt.consumerKey ?? '';
		this.consumerSecret = opt.consumerSecret ?? '';
		this.oauthToken = opt.oauthToken ?? '';
		this.oauthTokenSecret = opt.oauthTokenSecret ?? '';
		this.username = opt.username ?? '';
		this.password = opt.password ?? '';
		this.protocol = opt.protocol ?? '';
		this.apiDomain = opt.apiDomain ?? 'api.fanfou.com';
		this.oauthDomain = opt.oauthDomain ?? 'fanfou.com';
		this.hooks = opt.hooks ?? {};
		this.oauthInit();
		this.apiInit();
	}

	private static uriType(uri: string) {
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

		// @ts-expect-error
		const type = uriList[uri] || null;
		if (!type && /^\/favorites\/(?:create|destroy)\/.+/.test(uri)) {
			return 'status';
		}

		return type;
	}

	private static parseList(data: any, type: string) {
		const array = [];
		for (const i in data) {
			if (data[i]) {
				switch (type) {
					case 'timeline':
						array.push(new Status(data[i]));
						break;
					case 'users':
						array.push(new User(data[i]));
						break;
					case 'conversation':
						array.push(new DirectMessage(data[i]));
						break;
					case 'conversation-list':
						data[i].dm = new DirectMessage(data[i].dm);
						array.push(data[i]);
						break;
					default:
						break;
				}
			}
		}

		return array;
	}

	private static parseData(data: any, type: string) {
		switch (type) {
			case 'timeline':
			case 'users':
			case 'conversation':
			case 'conversation-list':
				return Fanfou.parseList(data, type);
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

	oauthInit() {
		this.o = new OAuth({
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

	async getRequestToken() {
		const url = `${this.oauthEndPoint ?? ''}/oauth/request_token`;
		const {Authorization} = this.o.toHeader(
			this.o.authorize({url, method: 'GET'})
		);
		try {
			const response = await got.get(url, {
				headers: {Authorization}
			});
			const {body} = response;
			const result = queryString.parse(body);
			// eslint-disable-next-line @typescript-eslint/dot-notation
			this.oauthToken = result['oauth_token'] as string;
			// eslint-disable-next-line @typescript-eslint/dot-notation
			this.oauthTokenSecret = result['oauth_token_secret'] as string;
			return this;
			// eslint-disable-next-line @typescript-eslint/no-implicit-any-catch
		} catch (error) {
			throw new FanfouError(error);
		}
	}

	async getAccessToken(token: Token) {
		const url = `${this.oauthEndPoint}/oauth/access_token`;
		const {Authorization} = this.o.toHeader(
			this.o.authorize(
				{url, method: 'GET'},
				{key: token.oauthToken, secret: token.oauthTokenSecret}
			)
		);
		try {
			const response = await got.get(url, {
				headers: {Authorization}
			});
			const {body} = response;
			const result = queryString.parse(body);
			// eslint-disable-next-line @typescript-eslint/dot-notation
			this.oauthToken = result['oauth_token'] as string;
			// eslint-disable-next-line @typescript-eslint/dot-notation
			this.oauthTokenSecret = result['oauth_token_secret'] as string;
			return this;
			// eslint-disable-next-line @typescript-eslint/no-implicit-any-catch
		} catch (error) {
			throw new FanfouError(error);
		}
	}

	async xauth() {
		const url = `${this.oauthEndPoint}/oauth/access_token`;
		const parameters = {
			x_auth_mode: 'client_auth',
			x_auth_password: this.password,
			x_auth_username: this.username
		};
		const {Authorization} = this.o.toHeader(
			this.o.authorize({url, method: 'POST'})
		);
		try {
			const response = await got.post(url, {
				headers: {
					Authorization,
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: queryString.stringify(parameters)
			});
			const {body} = response;
			const result = queryString.parse(body);
			// eslint-disable-next-line @typescript-eslint/dot-notation
			this.oauthToken = result['oauth_token'] as string;
			// eslint-disable-next-line @typescript-eslint/dot-notation
			this.oauthTokenSecret = result['oauth_token_secret'] as string;
			return this;
			// eslint-disable-next-line @typescript-eslint/no-implicit-any-catch
		} catch (error) {
			throw new FanfouError(error);
		}
	}

	async get(uri: string, parameters: any) {
		const query = queryString.stringify(parameters);
		const url = `${this.apiEndPoint}${uri}.json${query ? `?${query}` : ''}`;
		const token = {key: this.oauthToken, secret: this.oauthTokenSecret};
		const {Authorization} = this.o.toHeader(
			this.o.authorize({url, method: 'GET'}, token)
		);
		try {
			const {body} = await got.get(url, {
				headers: {
					Authorization,
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			});
			const response = JSON.parse(body);
			const result = Fanfou.parseData(response, Fanfou.uriType(uri));
			return result;
			// eslint-disable-next-line @typescript-eslint/no-implicit-any-catch
		} catch (error) {
			throw new FanfouError(error);
		}
	}

	async post(uri: string, parameters: any) {
		const url = `${this.apiEndPoint}${uri}.json`;
		const token = {key: this.oauthToken, secret: this.oauthTokenSecret};
		const isUpload = [
			'/photos/upload',
			'/account/update_profile_image'
		].includes(uri);
		const {Authorization} = this.o.toHeader(
			this.o.authorize(
				{url, method: 'POST', data: isUpload ? null : parameters},
				token
			)
		);
		let form = null;
		const headers = {
			Authorization,
			'Content-Type': 'application/x-www-form-urlencoded'
		};
		if (isUpload) {
			form = new FormData();
			for (const key of Object.keys(parameters)) {
				form.append(key, parameters[key]);
			}

			// @ts-expect-error
			delete headers['Content-Type'];
		}

		try {
			const {body} = await got.post(url, {
				headers,
				body: isUpload ? form ?? undefined : queryString.stringify(parameters)
			});
			const response = JSON.parse(body);
			const result = Fanfou.parseData(response, Fanfou.uriType(uri));
			return result;
			// eslint-disable-next-line @typescript-eslint/no-implicit-any-catch
		} catch (error) {
			throw new FanfouError(error);
		}
	}
}

export default Fanfou;

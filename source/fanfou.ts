import got from 'got';
// @ts-expect-error
import hmacsha1 from 'hmacsha1';
import OAuth from 'oauth-1.0a';
import queryString from 'query-string';
import camelcaseKeys from 'camelcase-keys';
// @ts-expect-error
import decamelizedKeys from 'decamelize-keys';
import FormData from 'form-data';
import FanfouError from './ff-error.js';
import {uriType, parseData} from './utils.js';

export type FanfouToken = {
	oauthToken: string;
	oauthTokenSecret: string;
};

export type FanfouHooks = {
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
	hooks?: FanfouHooks;
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
	apiEndPoint: string;
	oauthEndPoint: string;
	hooks: FanfouHooks;
	private readonly o: OAuth;

	constructor(options: FanfouOptions = {}) {
		this.consumerKey = options.consumerKey ?? '';
		this.consumerSecret = options.consumerSecret ?? '';
		this.oauthToken = options.oauthToken ?? '';
		this.oauthTokenSecret = options.oauthTokenSecret ?? '';
		this.username = options.username ?? '';
		this.password = options.password ?? '';
		this.protocol = options.protocol ?? 'http:';
		this.apiDomain = options.apiDomain ?? 'api.fanfou.com';
		this.oauthDomain = options.oauthDomain ?? 'fanfou.com';
		this.hooks = options.hooks ?? {};
		this.apiEndPoint = `${this.protocol}//${this.apiDomain}`;
		this.oauthEndPoint = `${this.protocol}//${this.oauthDomain}`;
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

	async getAccessToken(token: FanfouToken) {
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

	async get(uri: string, parameters?: any) {
		parameters = decamelizedKeys(parameters, '_');
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
			const response = camelcaseKeys(JSON.parse(body), {deep: true});
			const result = parseData(response, uriType(uri));
			return result;
			// eslint-disable-next-line @typescript-eslint/no-implicit-any-catch
		} catch (error) {
			throw new FanfouError(error);
		}
	}

	async post(uri: string, parameters?: any) {
		parameters = decamelizedKeys(parameters, '_');
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
			const response = camelcaseKeys(JSON.parse(body), {deep: true});
			const result = parseData(response, uriType(uri));
			return result;
			// eslint-disable-next-line @typescript-eslint/no-implicit-any-catch
		} catch (error) {
			throw new FanfouError(error);
		}
	}
}

export default Fanfou;

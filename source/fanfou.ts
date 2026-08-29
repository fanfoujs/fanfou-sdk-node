import camelcaseKeys from 'camelcase-keys';
import decamelizedKeys from 'decamelize-keys';
import FormData from 'form-data';
import hmacsha1 from 'hmacsha1';
import ky from 'ky';
import OAuth from 'oauth-1.0a';
import queryString from 'query-string';
import * as api from './api.js';
import FanfouError from './ff-error.js';

export type FanfouToken = {
	oauthToken: string;
	oauthTokenSecret: string;
};

export type FanfouHooks = {
	baseString?: (s: string) => string;
};

export type FanfouOptions = {
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

type BindFanfou<Function> = Function extends (
	ff: Fanfou,
	...arguments_: infer Arguments
) => infer Result
	? (...arguments_: Arguments) => Result
	: never;

type BoundApi = {
	[Key in keyof typeof api]: BindFanfou<(typeof api)[Key]>;
};

function bindApi(ff: Fanfou): BoundApi {
	return Object.fromEntries(
		Object.entries(api).map(([name, handler]) => [
			name,
			(...arguments_: unknown[]) =>
				(handler as (ff: Fanfou, ...arguments_: unknown[]) => unknown)(
					ff,
					...arguments_,
				),
		]),
	) as BoundApi;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging -- API methods are assigned in the constructor.
class Fanfou {
	private readonly apiEndPoint: string;
	private readonly oauthEndPoint: string;
	private readonly o: OAuth;
	consumerKey: string;
	consumerSecret: string;
	oauthToken: string;
	oauthTokenSecret: string;
	username: string;
	password: string;
	protocol: string;
	apiDomain: string;
	oauthDomain: string;
	hooks: FanfouHooks;

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
			// eslint-disable-next-line @typescript-eslint/naming-convention
			signature_method: 'HMAC-SHA1',
			// eslint-disable-next-line @typescript-eslint/naming-convention
			parameter_seperator: ',',
			/* c8 ignore start  */
			// eslint-disable-next-line @typescript-eslint/naming-convention
			hash_function: (baseString, key) => {
				const {baseString: baseStringHook} = this.hooks;
				if (baseStringHook) {
					baseString = baseStringHook(baseString);
				}

				return hmacsha1(key, baseString);
			},
			/* c8 ignore stop  */
		});
		Object.assign(this, bindApi(this));
	}

	async getRequestToken() {
		const url = `${this.oauthEndPoint}/oauth/request_token`;
		// eslint-disable-next-line @typescript-eslint/naming-convention
		const {Authorization} = this.o.toHeader(
			this.o.authorize({url, method: 'GET'}),
		);
		try {
			const body = await ky
				.get(url, {
					// eslint-disable-next-line @typescript-eslint/naming-convention
					headers: {Authorization},
				})
				.text();
			const result = queryString.parse(body);

			this.oauthToken = result['oauth_token'] as string;

			this.oauthTokenSecret = result['oauth_token_secret'] as string;
			return this;
			/* c8 ignore start */
		} catch (error) {
			throw new FanfouError(error);
		}
		/* c8 ignore stop */
	}

	async getAccessToken(token: FanfouToken) {
		const url = `${this.oauthEndPoint}/oauth/access_token`;
		// eslint-disable-next-line @typescript-eslint/naming-convention
		const {Authorization} = this.o.toHeader(
			this.o.authorize(
				{url, method: 'GET'},
				{key: token.oauthToken, secret: token.oauthTokenSecret},
			),
		);
		try {
			const body = await ky
				.get(url, {
					// eslint-disable-next-line @typescript-eslint/naming-convention
					headers: {Authorization},
				})
				.text();
			const result = queryString.parse(body);

			this.oauthToken = result['oauth_token'] as string;

			this.oauthTokenSecret = result['oauth_token_secret'] as string;
			return this;
			/* c8 ignore start */
		} catch (error) {
			throw new FanfouError(error);
		}
		/* c8 ignore stop */
	}

	async xauth() {
		const url = `${this.oauthEndPoint}/oauth/access_token`;
		const parameters = {
			// eslint-disable-next-line @typescript-eslint/naming-convention
			x_auth_mode: 'client_auth',
			// eslint-disable-next-line @typescript-eslint/naming-convention
			x_auth_password: this.password,
			// eslint-disable-next-line @typescript-eslint/naming-convention
			x_auth_username: this.username,
		};
		// eslint-disable-next-line @typescript-eslint/naming-convention
		const {Authorization} = this.o.toHeader(
			this.o.authorize({url, method: 'POST'}),
		);
		try {
			const body = await ky
				.post(url, {
					headers: {
						// eslint-disable-next-line @typescript-eslint/naming-convention
						Authorization,
						'Content-Type': 'application/x-www-form-urlencoded',
					},
					body: queryString.stringify(parameters),
				})
				.text();
			const result = queryString.parse(body);

			this.oauthToken = result['oauth_token'] as string;

			this.oauthTokenSecret = result['oauth_token_secret'] as string;
			return this;
			/* c8 ignore start */
		} catch (error) {
			throw new FanfouError(error);
		}
		/* c8 ignore stop */
	}

	async get<T>(uri: string, parameters: Record<string, any> = {}): Promise<T> {
		parameters = decamelizedKeys(parameters);
		const query = queryString.stringify(parameters);
		const url = `${this.apiEndPoint}${uri}.json${query ? `?${query}` : ''}`;
		const token = {key: this.oauthToken, secret: this.oauthTokenSecret};
		// eslint-disable-next-line @typescript-eslint/naming-convention
		const {Authorization} = this.o.toHeader(
			this.o.authorize({url, method: 'GET'}, token),
		);
		try {
			const body = await ky
				.get(url, {
					headers: {
						// eslint-disable-next-line @typescript-eslint/naming-convention
						Authorization,
						'Content-Type': 'application/x-www-form-urlencoded',
					},
				})
				.text();
			// eslint-disable-next-line @typescript-eslint/no-unsafe-return
			return camelcaseKeys(JSON.parse(body), {deep: true});
			/* c8 ignore start */
		} catch (error) {
			throw new FanfouError(error);
		}
		/* c8 ignore stop */
	}

	async post<T>(uri: string, parameters: Record<string, any> = {}): Promise<T> {
		parameters = decamelizedKeys(parameters);
		const url = `${this.apiEndPoint}${uri}.json`;
		const token = {key: this.oauthToken, secret: this.oauthTokenSecret};
		const isUpload = [
			'/photos/upload',
			'/account/update_profile_image',
		].includes(uri);
		// eslint-disable-next-line @typescript-eslint/naming-convention
		const {Authorization} = this.o.toHeader(
			this.o.authorize(
				{url, method: 'POST', data: isUpload ? null : parameters},
				token,
			),
		);
		let form: FormData;
		const headers = {
			// eslint-disable-next-line @typescript-eslint/naming-convention
			Authorization,
			'Content-Type': 'application/x-www-form-urlencoded',
		};
		if (isUpload) {
			form = new FormData();
			for (const [key, value] of Object.entries(parameters)) {
				form.append(key, value);
			}

			// @ts-expect-error: Drop `Content-Type`
			delete headers['Content-Type'];
		}

		try {
			const body = await ky
				.post(url, {
					headers,
					// @ts-expect-error: Can be `undefined`
					body: isUpload ? form : queryString.stringify(parameters),
				})
				.text();
			// eslint-disable-next-line @typescript-eslint/no-unsafe-return
			return camelcaseKeys(JSON.parse(body), {deep: true});
			/* c8 ignore start */
		} catch (error) {
			throw new FanfouError(error);
		}
		/* c8 ignore stop */
	}
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unsafe-declaration-merging -- Declares dynamically assigned API methods.
interface Fanfou extends BoundApi {}

export default Fanfou;

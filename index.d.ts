export = Fanfou;
export as namespace Fanfou;

declare class Fanfou {
	consumerKey: string;
	consumerSecret: string;
	oauthToken: string;
	oauthTokenSecret: string;
	username: string;
	password: string;
	protocol: string;
	apiDomain: string;
	oauthDomain: string;
	hooks: any;
	constructor(opt?: Fanfou.FanfouOptions)
	getRequestToken(): any;
	getAccessToken(token: Record<string, unknown>): any;
	xauth(): any;
	get(uri: string, parameters: Record<string, unknown>): any;
	post(uri: string, parameters: Record<string, unknown>): any;
	upload(uri: string, parameters: Record<string, unknown>): any;
}

declare namespace Fanfou {
	export interface FanfouOptions {
		consumerKey: string;
		consumerSecret: string;
		oauthToken?: string;
		oauthTokenSecret?: string;
		username?: string;
		password?: string;
		protocol?: string;
		fakeHttps?: boolean;
		apiDomain?: string;
		oauthDomain?: string;
		hooks?: {
			baseString?: (string: string) => any;
		};
	}
}

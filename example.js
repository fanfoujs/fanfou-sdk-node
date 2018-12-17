'use strict';

const Fanfou = require('.');

const {
	FANFOU_CONSUMER_KEY: consumerKey,
	FANFOU_CONSUMER_SECRET: consumerSecret,
	FANFOU_OAUTH_TOKEN: oauthToken,
	FANFOU_OAUTH_TOKEN_SECRET: oauthTokenSecret,
	FANFOU_USERNAME: username,
	FANFOU_PASSWORD: password
} = process.env;

// ...psst! Fill the options below
// consumerKey = ''
// consumerSecret = ''
// oauthToken = ''
// oauthTokenSecret = ''
// username = ''
// password = ''

(async () => {
	// CamelCase options
	const f1 = new Fanfou({
		consumerKey,
		consumerSecret,
		oauthToken,
		oauthTokenSecret
	});
	await f1.get('/statuses/home_timeline', {count: 10});

	// HTTPS connection
	const f2 = new Fanfou({
		consumerKey,
		consumerSecret,
		oauthToken,
		oauthTokenSecret,
		protocol: 'https:',
		fakeHttps: true
	});
	await f2.get('/statuses/home_timeline', {count: 5});

	// XAuth
	const f3 = new Fanfou({
		consumerKey,
		consumerSecret,
		username,
		password
	});
	await f3.xauth();
	await f3.get('/statuses/home_timeline', {count: 5});

	// Use baseString hook
	const f4 = new Fanfou({
		consumerKey,
		consumerSecret,
		oauthToken,
		oauthTokenSecret,
		protocol: 'https:',
		hooks: {
			baseString: str => {
				return str.replace('https', 'http');
			}
		}
	});
	await f4.get('/statuses/user_timeline', {count: 5});
})();

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

	// Snake_case options
	const f2 = new Fanfou({
		consumer_key: consumerKey,
		consumer_secret: consumerSecret,
		oauth_token: oauthToken,
		oauth_token_secret: oauthTokenSecret
	});
	await f2.get('/statuses/home_timeline', {count: 5});

	// HTTPS connection
	const f3 = new Fanfou({
		consumerKey,
		consumerSecret,
		oauthToken,
		oauthTokenSecret,
		protocol: 'https:',
		fakeHttps: true
	});
	await f3.get('/statuses/home_timeline', {count: 5});

	// XAuth
	const f4 = new Fanfou({
		consumerKey,
		consumerSecret,
		username,
		password
	});
	await f4.xauth();
	await f4.get('/statuses/home_timeline', {count: 5});
})();

'use strict';

const Fanfou = require('.');

const {
	FANFOU_CONSUMER_KEY: consumerKey,
	FANFOU_CONSUMER_SECRET: consumerSecret,
	// FANFOU_OAUTH_TOKEN: oauthToken,
	// FANFOU_OAUTH_TOKEN_SECRET: oauthTokenSecret,
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
	try {
	// CamelCase options
		const f1 = new Fanfou({
			consumerKey,
			consumerSecret,
			username,
			password
		});
		await f1.xauth();
		await f1.get('/statuses/home_timeline', {count: 10, format: 'html'});
		await f1.post('/statuses/update', {status: 'test'});
	} catch (error) {
		console.log(error.message);
	}
})();

'use strict';

const test = require('ava');
const Fanfou = require('.');

const {
	FANFOU_CONSUMER_KEY: consumerKey,
	FANFOU_CONSUMER_SECRET: consumerSecret,
	FANFOU_OAUTH_TOKEN: oauthToken,
	FANFOU_OAUTH_TOKEN_SECRET: oauthTokenSecret,
	FANFOU_USERNAME: username,
	FANFOU_PASSWORD: password
} = process.env;

const o = new Fanfou({
	consumerKey,
	consumerSecret,
	oauthToken,
	oauthTokenSecret
});

const x = new Fanfou({
	consumerKey,
	consumerSecret,
	username,
	password
});

test('test o.get()', async t => {
	const res = await o.get('/statuses/home_timeline', {});
	t.true(res.length > 0);
});

test('test o.post()', async t => {
	const res = await o.post('/statuses/update', {status: 'hi fanfou'});
	t.is(res.text, 'hi fanfou');
});

test('test xauth()', async t => {
	const tokens = await x.xauth();
	t.truthy(tokens);
});

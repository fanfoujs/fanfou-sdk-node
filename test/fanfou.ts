import http, {Server} from 'node:http';
import anyTest, {TestInterface} from 'ava';
import listen from 'test-listen';
import Fanfou from '../source/index.js';
import app from './fixtures/server.js';
import {baseStatus} from './fixtures/mocks.js';

const test = anyTest as TestInterface<{
	server: Server;
	ff: Fanfou;
}>;

test.before(async (t) => {
	const server = http.createServer(app());
	const prefixUrl = await listen(server);
	const domain = prefixUrl.replace('http://', '');

	t.context.server = server;
	t.context.ff = new Fanfou({
		apiDomain: domain,
		oauthDomain: domain,
	});
});

test.after.always((t) => {
	t.context.server.close();
});

test('create instance without options', (t) => {
	const ff = new Fanfou();

	t.is(ff.consumerKey, '');
	t.is(ff.consumerSecret, '');
	t.is(ff.oauthToken, '');
	t.is(ff.oauthTokenSecret, '');
	t.is(ff.username, '');
	t.is(ff.password, '');
	t.is(ff.protocol, 'http:');
	t.is(ff.apiDomain, 'api.fanfou.com');
	t.is(ff.oauthDomain, 'fanfou.com');
});

test('create instance with options', (t) => {
	const ff = new Fanfou({
		consumerKey: 'key',
		consumerSecret: 'secret',
		oauthToken: 'token',
		oauthTokenSecret: 'tokenSecret',
		username: 'username',
		password: 'password',
		protocol: 'https:',
		apiDomain: 'apiDomain',
		oauthDomain: 'oauthDomain',
		hooks: {
			baseString: (string_) => string_,
		},
	});

	t.is(ff.consumerKey, 'key');
	t.is(ff.consumerSecret, 'secret');
	t.is(ff.oauthToken, 'token');
	t.is(ff.oauthTokenSecret, 'tokenSecret');
	t.is(ff.username, 'username');
	t.is(ff.password, 'password');
	t.is(ff.protocol, 'https:');
	t.is(ff.apiDomain, 'apiDomain');
	t.is(ff.oauthDomain, 'oauthDomain');
	t.is(ff.hooks.baseString?.(''), '');
});

test.serial('initialize', async (t) => {
	const {ff} = t.context;

	t.is(ff.oauthToken, '');
	t.is(ff.oauthTokenSecret, '');
});

test.serial('getRequestToken', async (t) => {
	const {ff} = t.context;

	await ff.getRequestToken();
	t.is(ff.oauthToken, 'requestToken');
	t.is(ff.oauthTokenSecret, 'requestTokenSecret');
});

test.serial('getAccessToken', async (t) => {
	const {ff} = t.context;

	await ff.getAccessToken({
		oauthToken: ff.oauthToken,
		oauthTokenSecret: ff.oauthTokenSecret,
	});
	t.is(ff.oauthToken, 'accessToken');
	t.is(ff.oauthTokenSecret, 'accessTokenSecret');
});

test.serial('xauth', async (t) => {
	const {ff} = t.context;

	await ff.xauth();
	t.is(ff.oauthToken, 'xauthToken');
	t.is(ff.oauthTokenSecret, 'xauthTokenSecret');
});

test.serial('get', async (t) => {
	const {ff} = t.context;

	const status = await ff.get('/statuses/show', {id: 'statusId'});
	t.deepEqual(status, baseStatus);

	const statuses = await ff.get('/statuses/home_timeline');
	t.deepEqual(statuses, [baseStatus]);
});

test.serial('post', async (t) => {
	const {ff} = t.context;

	const user = await ff.post('/statuses/update', {status: 'statusText'});
	t.deepEqual(user, baseStatus);
});

test.serial('upload', async (t) => {
	const {ff} = t.context;

	const status = await ff.post('/photos/upload', {
		photo: 'it shoud be a ReadableStream',
		status: 'statusText',
	});
	t.deepEqual(status, baseStatus);
});

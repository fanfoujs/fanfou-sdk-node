import http, {type Server} from 'node:http';
import anyTest, {type TestFn} from 'ava';
import ky, {type HTTPError} from 'ky';
import listen from 'test-listen';
import {FanfouError} from '../source/index.js';
import app from './fixtures/server.js';

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const test = anyTest as TestFn<{
	server: Server;
	prefixUrl: string;
}>;

test.before(async (t) => {
	const server = http.createServer(app());
	const prefixUrl = await listen(server);

	t.context.server = server;
	t.context.prefixUrl = prefixUrl;
});

test.after.always((t) => {
	t.context.server.close();
});

test('handle Error', (t) => {
	const function_ = () => {
		throw new FanfouError(new Error('isError'));
	};

	const error = t.throws(
		() => {
			function_();
		},
		{instanceOf: FanfouError},
	);

	t.is(error?.message, 'isError');
});

test('handle Error via from()', async (t) => {
	const fanfouError = await FanfouError.from(new Error('fromError'));

	t.true(fanfouError instanceof FanfouError);
	t.is(fanfouError.message, 'fromError');
});

test('handle HTTPError', async (t) => {
	const httpError = await t.throwsAsync<HTTPError>(
		ky.get(`${t.context.prefixUrl}/nonexistent`),
	);

	const fanfouError = await FanfouError.from(httpError);

	t.true(fanfouError instanceof FanfouError);
	t.truthy(fanfouError.message);
});

test('handle unknown error', (t) => {
	const function_ = () => {
		throw new FanfouError('');
	};

	const error = t.throws(
		() => {
			function_();
		},
		{instanceOf: FanfouError},
	);

	t.is(error?.message, 'Unknown error');
});

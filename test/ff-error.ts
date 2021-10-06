import test from 'ava';
import got, {HTTPError} from 'got';
import {FanfouError} from '../source/index.js';

test('handle Error', (t) => {
	const fn = () => {
		throw new FanfouError(new Error('isError'));
	};

	const error = t.throws(
		() => {
			fn();
		},
		{instanceOf: FanfouError},
	);

	t.is(error.message, 'isError');
});

test('handle HTTPError', async (t) => {
	const httpError = await t.throwsAsync<HTTPError>(got(''));

	const fn = () => {
		throw new FanfouError(httpError);
	};

	const error = t.throws(
		() => {
			fn();
		},
		{instanceOf: FanfouError},
	);

	t.is(error.message, 'No URL protocol specified');
});

test('handle unknown error', (t) => {
	const fn = () => {
		throw new FanfouError('');
	};

	const error = t.throws(
		() => {
			fn();
		},
		{instanceOf: FanfouError},
	);

	t.is(error.message, 'Unknown error');
});

import test from 'ava';
import got, {type HTTPError} from 'got';
import {FanfouError} from '../source/index.js';

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

test('handle HTTPError', async (t) => {
	const httpError = await t.throwsAsync<HTTPError>(got(''));

	const function_ = () => {
		throw new FanfouError(httpError);
	};

	const error = t.throws(
		() => {
			function_();
		},
		{instanceOf: FanfouError},
	);

	t.true(error?.message.startsWith('Invalid URL'));
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

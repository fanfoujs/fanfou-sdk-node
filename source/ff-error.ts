import {HTTPError} from 'ky';

class FanfouError extends Error {
	err: Error | HTTPError;

	constructor(error: unknown) {
		super();
		this.name = 'FanfouError';
		this.err =
			error instanceof Error || error instanceof HTTPError
				? error
				: new Error('Unknown error');

		/* c8 ignore start */
		this.message =
			error instanceof HTTPError
				? error.message || `${error.response.status} error`
				: (this.err.message ?? 'Unknown error');
		/* c8 ignore stop */
	}
}

export default FanfouError;

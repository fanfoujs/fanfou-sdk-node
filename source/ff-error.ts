import {HTTPError} from 'got';

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
		if (error instanceof HTTPError) {
			const contentTypes = error.response.headers['content-type'];
			const [contentType] = contentTypes ? contentTypes.split(';') : [];
			switch (contentType) {
				case 'application/json': {
					this.message = JSON.parse(error.response.body as string).error;
					break;
				}

				case 'text/html': {
					const titleMatch = /<title>(?<msg>.+)<\/title>/.exec(
						error.response.body as string,
					);
					this.message =
						titleMatch?.groups?.['msg'] ?? `${error.response.statusCode} error`;
					break;
				}

				case 'application/xml': {
					const errorMatch = /<error>(?<msg>.+)<\/error>/.exec(
						error.response.body as string,
					);
					this.message =
						errorMatch?.groups?.['msg'] ?? `${error.response.statusCode} error`;
					break;
				}

				default: {
					this.message = 'Unknown error';
					break;
				}
			}
		} else {
			this.message = this.err.message ? this.err.message : 'Unknown error';
		}
		/* c8 ignore stop */
	}
}

export default FanfouError;

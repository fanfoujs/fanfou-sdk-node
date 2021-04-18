import {HTTPError} from 'got';

class FanfouError extends Error {
	err: Error | HTTPError;

	constructor(error: Error | HTTPError) {
		super();
		this.name = 'FanfouError';
		this.err = error;
		if (error instanceof HTTPError) {
			// @ts-expect-error
			const [contentType] = error.response.headers['content-type'].split(';');
			switch (contentType) {
				case 'application/json': {
					// @ts-expect-error
					this.message = JSON.parse(error.response.body).error;
					break;
				}

				case 'text/html': {
					// @ts-expect-error
					const titleMatch = error.response.body.match(
						/<title>(?<msg>.+)<\/title>/
					);
					if (titleMatch) {
						const {msg} = titleMatch.groups;
						this.message = msg;
					} else {
						this.message = `${error.response.statusCode} error`;
					}

					break;
				}

				case 'application/xml': {
					// @ts-expect-error
					const errorMatch = error.response.body.match(
						/<error>(?<msg>.+)<\/error>/
					);
					if (errorMatch) {
						const {msg} = errorMatch.groups;
						this.message = msg;
					} else {
						this.message = `${error.response.statusCode} error`;
					}

					break;
				}

				default: {
					this.message = 'Unknown error';
					break;
				}
			}
		} else {
			this.message = error.message ? error.message : 'Unknown error';
		}
	}
}

export default FanfouError;

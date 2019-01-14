'use strict';

class FanfouError extends Error {
	constructor(error) {
		super();
		this.name = 'FanfouError';
		this.err = error;
		if (error.name === 'HTTPError') {
			const [contentType] = error.headers['content-type'].split(';');
			switch (contentType) {
				case 'application/json': {
					this.message = JSON.parse(error.body).error;
					break;
				}

				case 'text/html': {
					const titleMatch = error.body.match(/<title>(.+)<\/title>/);
					if (titleMatch) {
						const [, msg] = titleMatch;
						this.message = msg;
					} else {
						this.message = `${error.statusCode} error`;
					}

					break;
				}

				case 'application/xml': {
					const errorMatch = error.body.match(/<error>(.+)<\/error>/);
					if (errorMatch) {
						const [, msg] = errorMatch;
						this.message = msg;
					} else {
						this.message = `${error.statusCode} error`;
					}

					break;
				}

				default: {
					this.message = 'Unknown error';
					break;
				}
			}
		}
	}
}

module.exports = FanfouError;


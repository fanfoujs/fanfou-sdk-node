import {HTTPError} from 'ky';

class FanfouError extends Error {
	static async from(error: unknown): Promise<FanfouError> {
		if (error instanceof HTTPError) {
			const body = await error.response.clone().text();
			return new FanfouError(error, body);
		}

		return new FanfouError(error);
	}

	err: Error | HTTPError;

	constructor(error: unknown, body?: string) {
		super();
		this.name = 'FanfouError';
		this.err =
			error instanceof Error || error instanceof HTTPError
				? error
				: new Error('Unknown error');

		/* c8 ignore start */
		if (error instanceof HTTPError && body !== undefined) {
			const contentType = error.response.headers.get('content-type');
			const [type] = contentType ? contentType.split(';') : [];

			switch (type) {
				case 'application/json': {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
					this.message = JSON.parse(body).error;
					break;
				}

				case 'text/html': {
					const titleMatch = /<title>(?<msg>.+)<\/title>/v.exec(body);
					this.message =
						titleMatch?.groups?.['msg'] ?? `${error.response.status} error`;
					break;
				}

				case 'application/xml': {
					const errorMatch = /<error>(?<msg>.+)<\/error>/v.exec(body);
					this.message =
						errorMatch?.groups?.['msg'] ?? `${error.response.status} error`;
					break;
				}

				default: {
					this.message = 'Unknown error';
					break;
				}
			}
		} else {
			this.message = this.err.message ?? 'Unknown error';
		}
		/* c8 ignore stop */
	}
}

export default FanfouError;

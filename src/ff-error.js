'use strict';

const {xml2js} = require('xml-js');

class FanfouError extends Error {
	constructor(httpResponse) {
		super();
		[this.contentType] = httpResponse.headers['content-type'].split(';');
		this.httpResponse = httpResponse;
		this.statusCode = httpResponse.statusCode;
		this._parseError();
	}

	_parseError() {
		switch (this.contentType) {
			case 'application/json':
				this.message = JSON.parse(this.httpResponse.body).error;
				break;
			case 'application/xml':
				this.message = xml2js(this.httpResponse.body, {compact: true}).hash.error._text;
				break;
			case 'text/html': {
				const titleMatch = this.httpResponse.body.match(/<title>(.+)<\/title>/);
				if (titleMatch) {
					[, this.message] = titleMatch;
				} else {
					this.message = `http status code ${this.httpResponse.statusCode}`;
				}
				break;
			}
			default:
				break;
		}
	}
}

module.exports = FanfouError;

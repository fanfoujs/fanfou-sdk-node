/* eslint @typescript-eslint/no-unsafe-call: off */
import decamelizeKeys from 'decamelize-keys';
import express from 'express';
import {baseStatus} from './mocks.js';

const server = () => {
	const app = express();

	app.get('/oauth/request_token', (request, response) => {
		const authPassed = request.headers.authorization?.startsWith(
			'OAuth oauth_consumer_key=""',
		);

		if (!authPassed) {
			response.status(401).send({error: 'Auth failed'});
		}

		response.send(
			'oauth_token=requestToken&oauth_token_secret=requestTokenSecret',
		);
	});

	app.get('/oauth/access_token', (_request, response) => {
		response.send(
			'oauth_token=accessToken&oauth_token_secret=accessTokenSecret',
		);
	});

	app.post('/oauth/access_token', (_request, response) => {
		response.send('oauth_token=xauthToken&oauth_token_secret=xauthTokenSecret');
	});

	app.get('/statuses/show.json', (_request, response) => {
		response.send(decamelizeKeys(baseStatus));
	});

	app.get('/statuses/home_timeline.json', (_request, response) => {
		response.send([decamelizeKeys(baseStatus)]);
	});

	app.post('/statuses/update.json', (_request, response) => {
		response.send(decamelizeKeys(baseStatus));
	});

	app.post('/photos/upload.json', (_request, response) => {
		response.send(decamelizeKeys(baseStatus));
	});

	return app;
};

export default server;

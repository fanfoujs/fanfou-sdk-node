'use strict';

const fs = require('fs');
const {OAuth} = require('oauth');
const qs = require('querystring');
const events = require('events');
const util = require('util');
const request = require('request');
const oauthSignature = require('oauth-signature');
const Timeline = require('./timeline');
const Status = require('./status');
const Streaming = require('./streaming');

class Fanfou {
  constructor(consumer_key, consumer_secret, oauth_token, oauth_token_secret) {
    this.protocol = 'http:';
    this.api_domain = 'api.fanfou.com';
    this.streaming_domain = 'stream.fanfou.com';
    this.type = 'json';
    this.consumer_key = consumer_key;
    this.consumer_secret = consumer_secret;
    this.oauth_token = oauth_token;
    this.oauth_token_secret = oauth_token_secret;
    this.is_streaming = false;
    this.oauth = new OAuth(
      'http://api.fanfou.com/oauth/request_token',
      'http://api.fanfou.com/oauth/access_token',
      consumer_key,
      consumer_secret,
      '1.0',
      null,
      'HMAC-SHA1'
    );
  }

  /**
   * @param uri
   * @param parameters
   * @param callback
   */
  get(uri, parameters, callback) {
    const url = this.protocol + '//' + this.api_domain + uri + '.' + this.type;
    this.oauth.get(
      url + '?' + qs.stringify(parameters),
      this.oauth_token,
      this.oauth_token_secret,
      (e, data, res) => {
        // TODO http status code
        if (e) callback(e, null, null);
        else {
          if (Fanfou._uriType(uri) === 'timeline') {
            callback(null, data, new Timeline(JSON.parse(data)));
          } else if (Fanfou._uriType(uri) === 'status') {
            callback(null, data, new Status(JSON.parse(data)));
          } else {
            callback(null, data, null);
          }
        }
      }
    );
  }

  /**
   * @param uri
   * @param parameters
   * @param callback
   */
  post(uri, parameters, callback) {
    const url = this.protocol + '//' + this.api_domain + uri + '.' + this.type;
    this.oauth.post(
      url,
      this.oauth_token,
      this.oauth_token_secret,
      parameters,
      (e, data, res) => {
        if (e) callback(e, null);
        else {
          if (Fanfou._uriType(uri) === 'timeline') {
            callback(null, data, new Timeline(JSON.parse(data)));
          } else if (Fanfou._uriType(uri) === 'status') {
            callback(null, data, new Status(JSON.parse(data)));
          } else {
            callback(null, data, null);
          }
          callback(null, data, null);
        }
      }
    )
  }

  /**
   * @param uri
   * @param parameters
   */
  stream (uri, parameters) {
    // prevent concurrences
    if (this.is_streaming === true) {
      console.warn('A previous streamer of this instance is currently running, cannot create more.');
      return;
    }

    // params validation
    if (uri === undefined) {
      uri = '/user';
    }

    if (typeof parameters !== 'object') {
      parameters = {};
    }

    const url = this.protocol + '//' + this.streaming_domain + '/1' + uri + '.' + this.type;
    let request = this.oauth.post(url, this.oauth_token, this.oauth_token_secret, parameters, null);

    let ee = new events.EventEmitter();

    ee.stop = () => {
      request.abort();
      this.is_streaming = false;
    };

    request.on('error', error => {
      ee.emit('error', {type: 'request', data: error});
      this.is_streaming = false;
    });

    // init and subsequent response data
    request.on('response', response => {
      if(response.statusCode > 200) {
        ee.emit('error', {type: 'response', data: {code: response.statusCode}});
        this.is_streaming = false;
      }
      else {
        this.is_streaming = true;

        ee.emit('connected');

        response.setEncoding('utf8');
        let data = '';

        response.on('data', chunk => {
          data += chunk.toString('utf8');

          if (data === '\r\n') {
            ee.emit('heartbeat');
            return;
          }

          let index, json;

          while((index = data.indexOf('\r\n')) > -1) {
            json = data.slice(0, index);
            data = data.slice(index + 2);
            if(json.length > 0) {
              try {
                let newStreaming = new Streaming(JSON.parse(json));
                ee.emit(newStreaming.schema, newStreaming);
              } catch(e) {
                ee.emit('garbage', data);
              }
            }
          }
        });

        response.on('error', error => {
          ee.emit('close', error);
        });

        response.on('end', () => {
          ee.emit('close', 'connection dropped');
        });

        response.on('close', () => {
          request.abort();
          this.is_streaming = false;
        });
      }
    });

    request.end();

    return ee;
  }

  /**
   * @param path
   * @param text
   * @param callback
   */
  upload(path, text, callback) {
    const method = 'POST';
    const url = this.protocol + '//' + this.api_domain + '/photos/upload.' + this.type;
    const params = {
      oauth_consumer_key: this.consumer_key,
      oauth_token: this.oauth_token,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: Math.floor(Date.now() / 1000),
      oauth_nonce: this.oauth._getNonce(6),
      oauth_version: '1.0',
    };
    const signature = oauthSignature.generate(
      method,
      url,
      params,
      this.consumer_secret,
      this.oauth_token_secret,
      {encodeSignature: false}
    );
    const authorizationHeader = this.oauth._buildAuthorizationHeaders(
      this.oauth._sortRequestParams(
        this.oauth._makeArrayOfArgumentsHash(params)
      ).concat([['oauth_signature', signature]])
    );
    const formData = {
      photo: fs.createReadStream(path),
      status: text,
    };
    request.post({
      url,
      formData,
      headers: {Authorization: authorizationHeader},
    }, (err, httpResponse, body) => {
      if (err) callback(err, null, null);
      else if (httpResponse.statusCode !== 200) callback(body, null, null);
      else callback(null, body, new Status(JSON.parse(body)));
    });
  }

  /**
   * @param uri
   * @returns {string}
   * @private
   */
  static _uriType(uri) {
    const uriList = {
      timeline: [
        '/search/public_timeline',
        '/search/user_timeline',
        '/photos/user_timeline',
        '/statuses/friends_timeine',
        '/statuses/home_timeline',
        '/statuses/public_timeline',
        '/statuses/replies',
        '/statuses/user_timeline',
        '/statuses/context_timeline',
        '/statuses/mentions',
        '/favorites'
      ],
      status: [
        '/statuses/destroy',
        '/statuses/update',
        '/statuses/show'
      ]
    };
    for (const type in uriList) {
      if (uriList.hasOwnProperty(type)) {
        for (const i in uriList[type]) {
          if (uriList[type].hasOwnProperty(i)) {
            if (uriList[type][i] === uri) {
              return type;
            }
          }
        }
      }
    }
    if (uri.match(/^\/favorites\/((destroy)|(create))\/.+$/g)) {
      return 'status';
    }
    if (uri.match(/^\/favorites\/.+$/g)) {
      return 'timeline';
    }
    return null;
  }
}

module.exports = Fanfou;

'use strict';

const fs = require('fs');
const {OAuth} = require('oauth');
const qs = require('querystring');
const request = require('request');
const oauthSignature = require('oauth-signature');

class Fanfou {
  constructor(consumer_key, consumer_secret, oauth_token, oauth_token_secret) {
    this.protocol = 'http:';
    this.api_domain = 'api.fanfou.com';
    this.type = 'json';
    this.consumer_key = consumer_key;
    this.consumer_secret = consumer_secret;
    this.oauth_token = oauth_token;
    this.oauth_token_secret = oauth_token_secret;
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

  get(uri, parameters, callback) {
    const url = this.protocol + '//' + this.api_domain + uri + '.' + this.type;
    this.oauth.get(
      url + '?' + qs.stringify(parameters),
      this.oauth_token,
      this.oauth_token_secret,
      (e, data, res) => {
        if (e) callback(e, null);
        else callback(null, data);
      }
    );
  }

  post(uri, parameters, callback) {
    const url = this.protocol + '//' + this.api_domain + uri + '.' + this.type;
    this.oauth.post(
      url,
      this.oauth_token,
      this.oauth_token_secret,
      parameters,
      (e, data, res) => {
        if (e) callback(e, null);
        else callback(null, data);
      }
    )
  }

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
      if (err) callback(err, null);
      else if (httpResponse.statusCode !== 200) callback(body, null);
      else callback(null, body);
    });
  }
}

module.exports = Fanfou;

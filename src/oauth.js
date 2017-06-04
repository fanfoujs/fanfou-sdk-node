'use strict'

const {OAuth} = require('oauth')
const qs = require('querystring')
const FanfouError = require('./ff-error')

Object.assign(OAuth.prototype, {
  getXAuthAccessToken (username, password, callback) {
    const xauthParams = {
      'x_auth_mode': 'client_auth',
      'x_auth_password': password,
      'x_auth_username': username
    }

    this._performSecureRequest(null, null, this._clientOptions.accessTokenHttpMethod, this._accessUrl, xauthParams, null, null, function (error, data, response) {
      response.body = data
      if (error) callback(new FanfouError(response))
      else {
        const results = qs.parse(data)
        const oauthAccessToken = results['oauth_token']
        delete results['oauth_token']
        const oauthAccessTokenSecret = results['oauth_token_secret']
        delete results['oauth_token_secret']
        callback(null, oauthAccessToken, oauthAccessTokenSecret, results)
      }
    })
  }
})

module.exports = OAuth

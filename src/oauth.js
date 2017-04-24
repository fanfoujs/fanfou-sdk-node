'use strict'

const {OAuth} = require('oauth')
const qs = require('querystring')

Object.assign(OAuth.prototype, {
  getXAuthAccessToken(username, password, callback) {
    const x_auth_params = {
      'x_auth_mode': 'client_auth',
      'x_auth_password': password,
      'x_auth_username': username
    }

    this._performSecureRequest(null, null, this._clientOptions.accessTokenHttpMethod, this._accessUrl, x_auth_params, null, null, function (error, data, response) {
      if (error) callback(error)
      else {
        const results = qs.parse(data)
        const oauth_access_token = results['oauth_token']
        delete results['oauth_token']
        const oauth_access_token_secret = results['oauth_token_secret']
        delete results['oauth_token_secret']
        callback(null, oauth_access_token, oauth_access_token_secret, results)
      }
    })
  }
})

module.exports = OAuth

'use strict'

const OAuth = require('./oauth')
const qs = require('querystring')
const events = require('events')
const request = require('request')
const oauthSignature = require('oauth-signature')
const Status = require('./status')
const Streaming = require('./streaming')

class Fanfou {
  constructor (options) {
    options = options || {}

    // required
    this.consumer_key = options.consumer_key
    this.consumer_secret = options.consumer_secret
    this.auth_type = options.auth_type

    // optional
    this.protocol = options.protocol || 'http:'
    this.api_domain = options.api_domain || 'api.fanfou.com'
    this.streaming_domain = options.streaming_domain || 'stream.fanfou.com'

    // oauth required
    if (this.auth_type === 'oauth') {
      this.oauth_token = options.oauth_token || ''
      this.oauth_token_secret = options.oauth_token_secret || ''
    }

    // xauth required
    if (this.auth_type === 'xauth') {
      this.username = options.username || ''
      this.password = options.password || ''
    }

    this.is_streaming = false
    this.oauth = new OAuth(
      'http://fanfou.com/oauth/request_token',
      'http://fanfou.com/oauth/access_token',
      this.consumer_key,
      this.consumer_secret,
      '1.0',
      null,
      'HMAC-SHA1'
    )
  }

  xauth (callback) {
    this.oauth.getXAuthAccessToken(this.username, this.password, (e, oauthToken, oauthTokenSecret, result) => {
      if (e) callback(e)
      else {
        this.oauth_token = oauthToken
        this.oauth_token_secret = oauthTokenSecret
        callback(null, {
          oauth_token: oauthToken,
          oauth_token_secret: oauthTokenSecret
        })
      }
    })
  }

  /**
   * @param uri
   * @param parameters
   * @param callback
   */
  get (uri, parameters, callback) {
    const url = this.protocol + '//' + this.api_domain + uri + '.json'
    this.oauth.get(
      url + '?' + qs.stringify(parameters),
      this.oauth_token,
      this.oauth_token_secret,
      (e, data, res) => {
        // TODO http status code
        if (e) callback(e, null, null)
        else {
          if (Fanfou._uriType(uri) === 'timeline') {
            const timeline = JSON.parse(data)
            const arr = []
            for (let i in timeline) {
              if (timeline.hasOwnProperty(i)) {
                arr.push(new Status(timeline[i]))
              }
            }
            callback(null, data, arr)
          } else if (Fanfou._uriType(uri) === 'status') {
            callback(null, data, new Status(JSON.parse(data)))
          } else {
            callback(null, data, null)
          }
        }
      }
    )
  }

  /**
   * @param uri
   * @param parameters
   * @param callback
   */
  post (uri, parameters, callback) {
    const url = this.protocol + '//' + this.api_domain + uri + '.json'
    this.oauth.post(
      url,
      this.oauth_token,
      this.oauth_token_secret,
      parameters,
      (e, data, res) => {
        if (e) callback(e, null)
        else {
          if (Fanfou._uriType(uri) === 'timeline') {
            const timeline = JSON.parse(data)
            const arr = []
            for (let i in timeline) {
              if (timeline.hasOwnProperty(i)) {
                arr.push(new Status(timeline[i]))
              }
            }
            callback(null, data, arr)
          } else if (Fanfou._uriType(uri) === 'status') {
            callback(null, data, new Status(JSON.parse(data)))
          } else {
            callback(null, data, null)
          }
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
      console.warn('A previous streamer of this instance is currently running, cannot create more.')
      return
    }

    // params validation
    if (uri === undefined) {
      uri = '/user'
    }

    if (typeof parameters !== 'object') {
      parameters = {}
    }

    const url = this.protocol + '//' + this.streaming_domain + '/1' + uri + '.json'
    let request = this.oauth.post(url, this.oauth_token, this.oauth_token_secret, parameters, null)

    let ee = new events.EventEmitter()

    ee.stop = () => {
      request.abort()
      this.is_streaming = false
    }

    request.on('error', error => {
      ee.emit('error', {type: 'request', data: error})
      this.is_streaming = false
    })

    // init and subsequent response data
    request.on('response', response => {
      if (response.statusCode > 200) {
        ee.emit('error', {type: 'response', data: {code: response.statusCode}})
        this.is_streaming = false
      } else {
        this.is_streaming = true

        ee.emit('connected')

        response.setEncoding('utf8')
        let data = ''

        response.on('data', chunk => {
          data += chunk.toString('utf8')

          if (data === '\r\n') {
            ee.emit('heartbeat')
            return
          }

          let index, json

          while ((index = data.indexOf('\r\n')) > -1) {
            json = data.slice(0, index)
            data = data.slice(index + 2)
            if (json.length > 0) {
              try {
                let newStreaming = new Streaming(JSON.parse(json))
                ee.emit(newStreaming.schema, newStreaming)
              } catch (e) {
                ee.emit('garbage', data)
              }
            }
          }
        })

        response.on('error', error => {
          ee.emit('close', error)
        })

        response.on('end', () => {
          ee.emit('close', 'connection dropped')
        })

        response.on('close', () => {
          request.abort()
          this.is_streaming = false
        })
      }
    })

    request.end()

    return ee
  }

  /**
   * @param stream
   * @param text
   * @param callback
   */
  upload (stream, text, callback) {
    const method = 'POST'
    const url = this.protocol + '//' + this.api_domain + '/photos/upload.json'
    const params = {
      oauth_consumer_key: this.consumer_key,
      oauth_token: this.oauth_token,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: Math.floor(Date.now() / 1000),
      oauth_nonce: this.oauth._getNonce(6),
      oauth_version: '1.0'
    }
    const signature = oauthSignature.generate(
      method,
      url,
      params,
      this.consumer_secret,
      this.oauth_token_secret,
      {encodeSignature: false}
    )
    const authorizationHeader = this.oauth._buildAuthorizationHeaders(
      this.oauth._sortRequestParams(
        this.oauth._makeArrayOfArgumentsHash(params)
      ).concat([['oauth_signature', signature]])
    )
    const formData = {
      photo: stream,
      status: text
    }
    request.post({
      url,
      formData,
      headers: {Authorization: authorizationHeader}
    }, (err, httpResponse, body) => {
      if (err) callback(err, null, null)
      else if (httpResponse.statusCode !== 200) callback(body, null, null)
      else callback(null, body, new Status(JSON.parse(body)))
    })
  }

  /**
   * @param uri
   * @returns {string}
   * @private
   */
  static _uriType (uri) {
    const uriList = {
      '/search/public_timeline': 'timeline',
      '/search/user_timeline': 'timeline',
      '/photos/user_timeline': 'timeline',
      '/statuses/friends_timeine': 'timeline',
      '/statuses/home_timeline': 'timeline',
      '/statuses/public_timeline': 'timeline',
      '/statuses/replies': 'timeline',
      '/statuses/user_timeline': 'timeline',
      '/statuses/context_timeline': 'timeline',
      '/statuses/mentions': 'timeline',
      '/favorites': 'timeline',
      '/statuses/destroy': 'status',
      '/statuses/update': 'status',
      '/statuses/show': 'status',
      '/favorites/destroy': 'status',
      '/favorites/create': 'status'
    }
    return uriList[uri] || null
  }
}

module.exports = Fanfou

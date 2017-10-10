'use strict'

const events = require('events')
const qs = require('querystring')
const request = require('request')
const isJson = require('validate.io-json')
const oauthSignature = require('oauth-signature')

const User = require('./user')
const OAuth = require('./oauth')
const Status = require('./status')
const Streaming = require('./streaming')
const FanfouError = require('./ff-error')
const DirectMessage = require('./direct-message')

class Fanfou {
  constructor (options) {
    options = options || {}

    // required
    this.consumer_key = options.consumer_key
    this.consumer_secret = options.consumer_secret
    this.auth_type = options.auth_type

    // optional
    this.protocol = options.protocol || 'http:'
    this.oauth_domain = options.oauth_domain || 'fanfou.com'
    this.api_domain = options.api_domain || 'api.fanfou.com'
    this.streaming_domain = options.streaming_domain || 'stream.fanfou.com'
    this.fakeHttps = options.fake_https || options.fakeHttps || false

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
      `${this.protocol}//${this.oauth_domain}/oauth/request_token`,
      `${this.protocol}//${this.oauth_domain}/oauth/access_token`,
      this.consumer_key,
      this.consumer_secret,
      '1.0',
      null,
      'HMAC-SHA1'
    )

    this.oauth.fakeHttps = this.fakeHttps
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

  get (uri, parameters, callback) {
    const url = this.protocol + '//' + this.api_domain + uri + '.json'
    this.oauth.get(
      url + '?' + qs.stringify(parameters),
      this.oauth_token,
      this.oauth_token_secret,
      (e, rawData, httpResponse) => {
        if (e) {
          if (httpResponse && rawData) {
            httpResponse.body = rawData
            callback(new FanfouError(httpResponse))
          } else callback(e)
        } else if (isJson(rawData)) {
          const data = JSON.parse(rawData)
          if (data.error) callback(null, data, rawData)
          else {
            const result = Fanfou._parseData(data, Fanfou._uriType(uri))
            callback(null, result, rawData)
          }
        } else callback(new Error('invalid body'))
      }
    )
  }

  post (uri, parameters, callback) {
    const url = this.protocol + '//' + this.api_domain + uri + '.json'
    this.oauth.post(
      url,
      this.oauth_token,
      this.oauth_token_secret,
      parameters,
      (e, rawData, httpResponse) => {
        if (e) {
          if (httpResponse && rawData) {
            httpResponse.body = rawData
            callback(new FanfouError(httpResponse))
          } else callback(e)
        } else if (isJson(rawData)) {
          const data = JSON.parse(rawData)
          if (data.error) callback(null, data, rawData)
          else {
            const result = Fanfou._parseData(data, Fanfou._uriType(uri))
            callback(null, result, rawData)
          }
        } else callback(new Error('invalid body'))
      }
    )
  }

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
          ee.emit('close', 'connection closed')
          request.abort()
          this.is_streaming = false
        })
      }
    })

    request.end()

    return ee
  }

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
      this.fakeHttps ? url.replace('https', 'http') : url,
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
      if (err) {
        callback(err)
      } else if (httpResponse.statusCode !== 200) {
        callback(new FanfouError(httpResponse))
      } else {
        callback(null, new Status(JSON.parse(body)), body)
      }
    })
  }

  static _uriType (uri) {
    const uriList = {
      // Timeline
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

      // Status
      '/statuses/update': 'status',
      '/statuses/show': 'status',
      '/favorites/destroy': 'status',
      '/favorites/create': 'status',

      // Users
      '/users/tagged': 'users',
      '/users/followers': 'users',
      '/users/friends': 'users',
      '/friendships/requests': 'users',

      // User
      '/users/show': 'user',
      '/friendships/create': 'user',
      '/friendships/destroy': 'user',

      // Conversation
      '/direct_messages/conversation': 'conversation',
      '/direct_messages/inbox': 'conversation',
      '/direct_messages/sent': 'conversation',

      // Conversation List
      '/direct_messages/conversation_list': 'conversation-list',

      // Direct Message
      '/direct_messages/new': 'dm',
      '/direct_messages/destroy': 'dm'

    }
    return uriList[uri] || null
  }

  static _parseList (data, type) {
    const arr = []
    for (const i in data) {
      if (data[i]) {
        switch (type) {
          case 'timeline':
            arr.push(new Status(data[i]))
            break
          case 'users':
            arr.push(new User(data[i]))
            break
          case 'conversation':
            arr.push(new DirectMessage(data[i]))
            break
          case 'conversation-list':
            data[i].dm = new DirectMessage(data[i].dm)
            arr.push(data[i])
            break
          default:
            break
        }
      }
    }
    return arr
  }

  static _parseData (data, type) {
    switch (type) {
      case 'timeline':
      case 'users':
      case 'conversation':
      case 'conversation-list':
        return Fanfou._parseList(data, type)
      case 'status':
        return new Status(data)
      case 'user':
        return new User(data)
      case 'dm':
        return new DirectMessage(data)
      default:
        return data
    }
  }
}

module.exports = Fanfou

'use strict'

const xml2Json = require('xml2json').toJson

class FanfouError extends Error {
  constructor (httpResponse) {
    super()
    this.contentType = httpResponse.headers['content-type'].split(';')[0]
    this.httpResponse = httpResponse
    this.statusCode = httpResponse.statusCode
    this._parseError()
  }

  _parseError () {
    switch (this.contentType) {
      case 'application/json':
        this.message = JSON.parse(this.httpResponse.body).error
        break
      case 'application/xml':
        this.message = JSON.parse(xml2Json(this.httpResponse.body)).hash.error
        break
      case 'text/html':
        this.message = this.httpResponse.body.match(/<title>(.+)<\/title>/)[1]
        break
      default:
        break
    }
  }
}

module.exports = FanfouError

'use strict'

const he = require('he')
const User = require('./user')
const Photo = require('./photo')

class Status {
  constructor (status) {
    this.created_at = status.created_at
    this.id = status.id
    this.rawid = status.rawid
    this.text = status.text
    this.source = status.source
    this.truncated = status.truncated
    this.in_reply_to_status_id = status.in_reply_to_status_id
    this.in_reply_to_user_id = status.in_reply_to_user_id
    this.favorited = status.favorited
    this.in_reply_to_screen_name = status.in_reply_to_screen_name
    this.is_self = status.is_self
    this.location = status.location
    if (status.hasOwnProperty('repost_status_id')) {
      this.repost_status_id = status.repost_status_id
    }
    if (status.hasOwnProperty('repost_user_id')) {
      this.repost_user_id = status.repost_user_id
    }
    if (status.hasOwnProperty('repost_screen_name')) {
      this.repost_screen_name = status.repost_screen_name
    }
    if (status.hasOwnProperty('repost_status')) {
      this.repost_status = new Status(status.repost_status)
    }
    this.user = new User(status.user)
    if (status.hasOwnProperty('photo')) {
      this.photo = new Photo(status.photo)
    }
    this.type = this._getType()
    this.source_url = this._getSourceUrl()
    this.source_name = this._getSourceName()
    this.txt = this._getTxt()
    this.plain_text = this._getPlainText()
  }

  isReply () {
    return this.in_reply_to_status_id !== '' || this.in_reply_to_user_id !== ''
  }

  isRepost () {
    return this.hasOwnProperty('repost_status_id') && this.repost_status_id !== ''
  }

  isOrigin () {
    return !(this.isReply() || this.isRepost())
  }

  isOriginRepost () {
    return this.isOrigin() && this.text.match(/转@/g)
  }

  _getType () {
    if (this.isReply()) return 'reply'
    if (this.isRepost()) return 'repost'
    if (this.isOrigin()) return 'origin'
    return 'unknown'
  }

  _getSourceUrl () {
    if (this.source.match(/<a href="(.+)" target="_blank">.+<\/a>/)) {
      return this.source.match(/<a href="(.+)" target="_blank">.+<\/a>/)[1]
    } else {
      return ''
    }
  }

  _getSourceName () {
    if (this.source.match(/<a href=".+" target="_blank">(.+)<\/a>/)) {
      return this.source.match(/<a href=".+" target="_blank">(.+)<\/a>/)[1]
    } else {
      return this.source
    }
  }

  _getTxt () {
    const pattern = /[@#]?<a href="(.*?)".*?>([\s\S\n]*?)<\/a>#?/g
    const match = this.text.match(pattern)
    const txt = []
    let theText = this.text
    if (match) {
      match.forEach(item => {
        const index = theText.indexOf(item)
        if (index > 0) txt.push({type: 'text', text: he.decode(theText.substr(0, index))})
        if (item.substr(0, 1) === '#') {
          const matchText = item.match(/#<a href=".*?".?>([\s\S\n]*?)<\/a>#/)
          txt.push({
            type: 'tag',
            text: `#${he.decode(matchText[1])}#`,
            query: he.decode(matchText[1])
          })
        }
        if (item.substr(0, 1) === '@') {
          const matchText = item.match(/@<a href="http:\/\/fanfou.com\/(.*?)".*?>(.*?)<\/a>/)
          txt.push({
            type: 'at',
            text: `@${he.decode(matchText[2])}`,
            name: he.decode(matchText[2]),
            id: matchText[1]
          })
        }
        if (item.substr(0, 1) === '<') {
          const matchText = item.match(/<a href="(.*?)".*?>(.*?)<\/a>/)
          txt.push({
            type: 'link',
            text: matchText[2],
            link: matchText[1]
          })
        }
        theText = theText.substr(index + item.length)
      })
      if (theText.length) {
        txt.push({
          type: 'text',
          text: he.decode(theText)
        })
      }
      return txt
    } else {
      return [{type: 'text', text: he.decode(theText)}]
    }
  }

  _getPlainText () {
    let text = ''
    this.txt.forEach(t => {
      text += t.text
    })
    return he.decode(text)
  }
}

module.exports = Status

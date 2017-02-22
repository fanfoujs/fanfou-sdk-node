'use strict';

const User = require('./user');
const Photo = require('./photo');

class Status {
  constructor(status) {
    this.created_at = status.created_at;
    this.id = status.id;
    this.rawid = status.rawid;
    this.text = status.text;
    this.source = status.source;
    this.truncated = status.truncated;
    this.in_reply_to_status_id = status.in_reply_to_status_id;
    this.in_reply_to_user_id = status.in_reply_to_user_id;
    this.favorited = status.favorited;
    this.in_reply_to_screen_name = status.in_reply_to_screen_name;
    this.is_self = status.is_self;
    this.location = status.location;
    if (status.hasOwnProperty('repost_status_id')) {
      this.repost_status_id = status.repost_status_id;
    }
    if (status.hasOwnProperty('repost_user_id')) {
      this.repost_user_id = status.repost_user_id;
    }
    if (status.hasOwnProperty('repost_screen_name')) {
      this.repost_screen_name = status.repost_screen_name;
    }
    if (status.hasOwnProperty('repost_status')) {
      this.repost_status = new Status(status.repost_status);
    }
    this.user = new User(status.user);
    if (status.hasOwnProperty('photo')) {
      this.photo = new Photo(status.photo);
    }
    this.type = this.getType();
  }

  isReply() {
    return this.in_reply_to_status_id !== '' || this.in_reply_to_user_id !== '';
  }

  isRepost() {
    return this.hasOwnProperty('repost_status_id') && this.repost_status_id !== '';
  }

  isOrigin() {
    return !(this.isReply() || this.isRepost());
  }

  isOriginRt() {
    return this.isOrigin() && this.text.match(/转@/g);
  }

  getType() {
    if (this.isReply()) return 'reply';
    if (this.isRepost()) return 'repost';
    if (this.isOrigin()) return 'origin';
    return 'unknown';
  }
}

module.exports = Status;

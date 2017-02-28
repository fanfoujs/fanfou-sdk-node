/**
 * Created by mogita on 2/24/17.
 */
/*jslint node: true*/
"use strict";

const User = require('./user');
const Status = require('./status');

class Streaming {
  constructor(streaming) {
    this.event = streaming.event;

    // Splits an "event" string apart for better accessibility
    this.schema = this.getSchema();
    this.action = this.getAction();

    this.created_at = streaming.created_at;
    this.source = null;
    this.target = null;
    this.object = null;
    this.is_replied = false;
    this.replied_by = null;
    this.is_mentioned = false;
    this.mentioned_by = null;

    if (typeof streaming.source === 'object' && streaming.source !== null) {
      this.source = new User(streaming.source);
    }

    if (typeof streaming.target === 'object' && streaming.target !== null) {
      this.target = new User(streaming.target);
    }

    if (typeof streaming.object === 'object' && streaming.object !== null) {
      this.object = new Status(streaming.object);
    }

    if (this.schema === 'message' && this.action === 'create') {
      let by = this.source.screen_name;
      if (by === undefined || by === '') {
        by = this.source.id;
      }

      if (this.target !== null) {
        this.is_replied = true;
        this.replied_by = by;
      }
      else {
        let ruid = this.object.repost_user_id;
        if (ruid !== undefined && ruid !== '' && ruid !== this.source.id) {
          this.is_mentioned = true;
          this.mentioned_by = by;
        }
      }
    }
  }

  getSchema () {
    // user, friends, fav, message
    return this.event.split('.')[0] || '';
  }

  getAction () {
    // create, delete, request, updateprofile
    return this.event.split('.')[1] || '';
  }
}

module.exports = Streaming;
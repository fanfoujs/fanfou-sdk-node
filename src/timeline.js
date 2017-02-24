'use strict';

const Status = require('./status');

class Timeline {
  constructor(timeline) {
    for (let i in timeline) {
      if (timeline.hasOwnProperty(i)) {
        this[i] = new Status(timeline[i]);
      }
    }
    this.length = timeline.length;
  }
}

module.exports = Timeline;

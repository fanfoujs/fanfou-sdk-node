'use strict'

class Photo {
  constructor (photo) {
    this.url = photo.url
    this.imageurl = photo.imageurl
    this.thumburl = photo.thumburl
    this.largeurl = photo.largeurl
    this.originurl = photo.largeurl.replace(/@.+\..+$/g, '')
  }
}

module.exports = Photo

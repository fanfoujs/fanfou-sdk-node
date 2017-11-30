# fanfou-sdk-node

[![](https://badges.greenkeeper.io/LitoMore/fanfou-sdk-node.svg)](https://greenkeeper.io/)
[![](https://img.shields.io/travis/LitoMore/fanfou-sdk-node/master.svg)](https://travis-ci.org/LitoMore/fanfou-sdk-node)
[![](https://img.shields.io/appveyor/ci/LitoMore/fanfou-sdk-node/master.svg)](https://ci.appveyor.com/project/LitoMore/fanfou-sdk-node)
[![](https://img.shields.io/npm/v/fanfou-sdk.svg)](https://www.npmjs.com/package/fanfou-sdk)
[![](https://img.shields.io/npm/l/fanfou-sdk.svg)](https://github.com/LitoMore/fanfou-sdk-node/blob/master/LICENSE)
[![](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

Fanfou SDK for Node.js

## Installation

```bash
$ npm install fanfou-sdk
```
## Initialization

```javascript
const Fanfou = require('fanfou-sdk')
```

**OAuth**

```javascript
const ff = new Fanfou({
  auth_type: 'oauth',
  consumer_key: consumer_key,
  consumer_secret: consumer_secret,
  oauth_token: oauth_token,
  oauth_token_secret: oauth_token_secret
})

ff.get('/statuses/home_timeline', {format: 'html'}, (err, res) => {
  if (err) console.log(err.message)
  else console.log(res)
})
```

**XAuth**

```javascript
const ff = new Fanfou({
  auth_type: 'xauth',
  consumer_key: consumer_key,
  consumer_secret: consumer_secret,
  username: username,
  password: password
})

ff.xauth((err) => {
  if (err) {
    console.log(err.message)
  } else {
    ff.get('/statuses/public_timeline', {count: 10}, (e, res) => {
      if (e) console.log(e.message)
      else console.log(res)
    })

    ff.post('/statuses/update', {status: 'Hi Fanfou'}, (e, res) => {
      if (e) console.log(e.message)
      else console.log(res)
    })
  }
})
```

**Parameters**

- `consumser_key: String` The Consumser Key
- `consumser_secret: String` The Consumer Secret
- `oauth_token: String` The OAuth Token
- `oauth_token_secret: String` The OAuth Token Secret
- `username: String` The Fanfou username
- `password: String` The Fanfou password

## Usage

**Methods**

```javascript
ff.get(uri, parameters, callback)
ff.post(uri, parameters, callback)
ff.upload(stream, text, callback)
```

**Parameters**

- `uri: String` URI to be requested upon
- `parameters: Object` Parameters to be submitted
- `stream: String | Buffer` Readable Stream
- `text: String` Status content
- `callback: Function` Method to be invoked upon result

**Examples**

```javascript
// OAuth
ff.get('/statuses/home_timeline', {}, (e, timeline) => {
  if (e) console.log(e.message)
  else console.log(timeline)
})

ff.post('/statuses/update', {status: 'post test'}, (e, status) => {
  if (e) console.log(e.message)
  else console.log(status)
})

ff.upload(fs.createReadStream(path), 'nice day', (e, status) => {
  if (e) console.log(e.message)
  else console.log(status)
})

// XAuth
ff.xauth((e, res) => {
  if (e) console.log(e.message)
  else {
    ff.get('/statuses/public_timeline', {}, (e, timeline) => {
      if (e) console.log(e.message)
      else console.log(timeline)
    })
  }
})
```

**Streaming API**

The built-in Streaming API has been deprecated.

## Related

- [nofan](https://github.com/LitoMore/nofan) - CLI for Fanfou
- [xiaofan](https://github.com/fanfoujs/xiaofan) - WeApp for Fanfou
- [fanfou-streamer](https://github.com/LitoMore/fanfou-streamer) - Fanfou Streaming SDK for Node.js
- [alfred-fanfou](https://github.com/LitoMore/alfred-fanfou) - Alfred 3 workflow for Fanfou
- [cerebro-fanfou](https://github.com/LitoMore/cerebro-fanfou) - A cerebro plugin for Fanfou

## License

MIT © [LitoMore](https://github.com/LitoMore)

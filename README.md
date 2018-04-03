# fanfou-sdk-node

[![](https://badges.greenkeeper.io/LitoMore/fanfou-sdk-node.svg)](https://greenkeeper.io/)
[![](https://img.shields.io/travis/LitoMore/fanfou-sdk-node/master.svg)](https://travis-ci.org/LitoMore/fanfou-sdk-node)
[![](https://img.shields.io/appveyor/ci/LitoMore/fanfou-sdk-node/master.svg)](https://ci.appveyor.com/project/LitoMore/fanfou-sdk-node)
[![](https://img.shields.io/npm/v/fanfou-sdk.svg)](https://www.npmjs.com/package/fanfou-sdk)
[![](https://img.shields.io/npm/l/fanfou-sdk.svg)](https://github.com/LitoMore/fanfou-sdk-node/blob/master/LICENSE)
[![](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

Fanfou SDK for Node.js

## Install

```bash
$ npm i fanfou-sdk
```

## Usage

```javascript
const Fanfou = require('fanfou-sdk')
```

**OAuth**

```javascript
const ff = new Fanfou({
  consumerKey: '',
  consumerSecret: '',
  oauthToken: '',
  oauthTokenSecret: ''
})

ff.get('/statuses/home_timeline', {format: 'html'}, (err, res) => {
  if (err) console.log(err.message)
  else console.log(res)
})
```

**XAuth**

```javascript
const ff = new Fanfou({
  authType: 'xauth',
  consumerKey: '',
  consumerSecret: '',
  username: username,
  password: password
})

ff.xauth(err => {
  if (err) {
    console.log(err.message)
  } else {
    ff.get('/statuses/public_timeline', {count: 10}, (err, res) => {
      if (err) console.log(e.message)
      else console.log(res)
    })

    ff.post('/statuses/update', {status: 'Hi Fanfou'}, (err, res) => {
      if (err) console.log(err.message)
      else console.log(res)
    })
  }
})
```

> For more usages, see the [example](https://github.com/LitoMore/fanfou-sdk-node/blob/master/example.js).

**Options**

- `authType`: Support `oauth` and `xuath`, default is `oauth`
- `consumerKey`: The consumer key
- `consumerSecret`: The consumer secret
- `oauthToken`: The OAuth token
- `oauthTokenSecret`: The OAuth token secret
- `username`: The Fanfou username
- `password`: The Fanfou password
- `protocol`: Set the prototol, default is `http:`
- `fakeHttps`: A hook to replace the OAuth basestring, default is `false`
- `apiDomain`: Set the API domain, default is `api.fanfou.com`
- `oauthDomain`: Set the OAuth domain, default is `fanfou.com`

> For more Fanfou API docs, see the [Fanfou API doc](https://github.com/FanfouAPI/FanFouAPIDoc/wiki).

## API

```javascript
ff.get(uri, params, callback)
ff.post(uri, params, callback)
ff.up(uri, params, callback)
ff.upload(stream, text, callback)  // This API has been deprecated, use `ff.up()` instead.
```

**Examples**

```javascript
// OAuth
ff.get('/statuses/home_timeline', {}, (err, timeline) => {
  if (err) console.log(err.message)
  else console.log(timeline)
})

ff.post('/statuses/update', {status: 'post test'}, (err, status) => {
  if (err) console.log(err.message)
  else console.log(status)
})

ff.up('/photos/upload', {photo: fs.createReadStream(path), status: 'unicorn'}, (err, res) => {
  if (err) console.log(err.message)
  else console.log(res)
})

// `ff.upload()` has been deprecated.
ff.upload(fs.createReadStream(path), 'nice day', (err, status) => {
  if (err) console.log(err.message)
  else console.log(status)
})

// XAuth
ff.xauth((err, res) => {
  if (err) console.log(e.message)
  else {
    ff.get('/statuses/public_timeline', {}, (err, timeline) => {
      if (err) console.log(e.message)
      else console.log(timeline)
    })
  }
})
```

### Streaming API

The built-in Streaming API has been deprecated. Please use [fanfou-streamer](https://github.com/LitoMore/fanfou-streamer) instead.

## Related

- [nofan](https://github.com/LitoMore/nofan) - CLI for Fanfou
- [xiaofan](https://github.com/fanfoujs/xiaofan) - WeApp for Fanfou
- [fanfou-streamer](https://github.com/LitoMore/fanfou-streamer) - Fanfou Streaming SDK for Node.js
- [alfred-fanfou](https://github.com/LitoMore/alfred-fanfou) - Alfred 3 workflow for Fanfou
- [kap-fanfou](https://github.com/LitoMore/kap-fanfou) - Kap plugin that share on Fanfou
- [cerebro-fanfou](https://github.com/LitoMore/cerebro-fanfou) - A cerebro plugin for Fanfou

## License

MIT © [LitoMore](https://github.com/LitoMore)

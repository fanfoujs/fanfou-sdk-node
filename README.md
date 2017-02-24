# fanfou-sdk-node
Fanfou SDK for Node.js

[![](https://img.shields.io/travis/LitoMore/fanfou-sdk-node.svg)](https://travis-ci.org/LitoMore/fanfou-sdk-node)
[![](https://img.shields.io/npm/v/fanfou-sdk.svg)](https://www.npmjs.com/package/fanfou-sdk)
[![](https://img.shields.io/npm/l/fanfou-sdk.svg)](https://github.com/LitoMore/fanfou-sdk-node/blob/master/LICENSE)

## Installation

```bash
$ npm install fanfou-sdk
```
## Initialization

```javascript
var Fanfou = require('fanfou-sdk');
var ff = new Fanfou(
  consumer_key,
  consumer_secret,
  oauth_token,
  oauth_token_secret
);
````
**Parameters**

- `consumser_key: String` The Consumser Key
- `consumser_secret: String` The Consumer Secret
- `oauth_token: String` The OAuth Token
- `oauth_token_secret: String` The OAuth Token Secret

## Usage

**Methods**

```javascript
ff.get(uri, parameters, callback);
ff.post(uri, parameters, callback);
ff.upload(path, text, callback);
```

**Parameters**

- `uri: String` URI to be requested upon
- `parameters: Object` Parameters to be submitted
- `path: String` Photo absolute path
- `text: String` Status content
- `callback: Function` Method to be invoked upon result

**Examples**

```javascript
ff.get('/statuses/home_timeline', {}, function (e, res, timeline) {
  if (e) console.error(e);
  else {
    console.log(res);
    console.log(timeline);
  }
});

ff.post('/statuses/update', {status: 'post test'}, function (e, res, status) {
  if (e) console.error(e);
  else {
    console.log(res);
    console.log(status);
  }
});

ff.upload('/Users/litomore/Desktop/fanfou.png', 'nice day', function (e, res, status) {
  if (e) console.error(e);
  else {
    console.log(res);
    console.log(status);
  }
});
```

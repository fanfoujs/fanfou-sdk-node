# fanfou-sdk-node
Fanfou SDK for Node.js

## Installation

```bash
$ npm install fanfou-sdk
```
## Initialization

```javascript
var Fanfou = require('fanfou-oauth');
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
ff.get('/statuses/home_timeline', {}, function (e, res) {
  if (e) console.error(e);
  else console.log(res);
});

ff.post('/statuses/update', {status: 'post test'}, function (e, res) {
  if (e) console.error(e);
  else console.log(res);
});

ff.upload('/Users/litomore/Desktop/fanfou.png', 'nice day', function (e, res) {
  if (e) console.error(e);
  else console.log(res);
});
```

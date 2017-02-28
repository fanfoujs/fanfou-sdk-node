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
// OAuth
var Fanfou = require('fanfou-sdk');
var ff = new Fanfou(
  consumer_key,
  consumer_secret,
  oauth_token,
  oauth_token_secret
);

// XAuth
var ff = new Fanfou(consumer_key, consumer_secret, '', '');
ff.oauth.getXAuthAccessToken(username, password, function(error, oauth_token, oauth_token_secret, result) {
  ff.oauth.oauth_token = oauth_token;
  ff.oauth.oauth_token_secret = oauth_token_secret;
  
  ff.get(uri, parameters, callback);
});
````
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
ff.get(uri, parameters, callback);
ff.post(uri, parameters, callback);
ff.upload(path, text, callback);
ff.stream(uri);
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

**Streaming API**

Fanfou SDK offers the ability to work with the Streaming API, based on the EventEmitter.

```javascript
// To start a streamer
var streamer = ff.stream();

// Now post a new status on fanfou, this will trigger the 'message' event
streamer.on('message', function (data) {
  console.log(data.schema + ' ' + data.action + ': ' + data.object.text);
  // OUTPUT: message create: hello fanfou
});

// Listen to reply or mention events
streamer.on('message', function (data) {
  if (data.is_mentioned) {
    console.log('Is mentioned by @' + data.mentioned_by);
    // OUTPUT: Is mentioned by @fanfou
  }

  if (data.is_replied) {
    console.log('Is replied by @' + data.replied_by);
    // OUTPUT: Is replied by @fanfou
  }
});

// Or listen to the favourite events
streamer.on('fav', function (data) {
  console.log(data.schema + ' ' + data.action + ': ' + data.object.text);
});

// To stop the streamer
streamer.stop();
```

Available events:

|Event|Available Actions|
:---|:---
message|<p>`create`: Current user posts a new status, or receives a reply/mention from another user</p><p>`delete`: Current user deletes a status
user|`updateprofile`: Current user updates the profile</p>
friends|<p>`create`: Current user follows a user</p><p>`delete`: Current user unfollows a user (being unfollowed will not trigger any events)</p><p>`request`: Current user makes a follow request to a user</p>
fav|<p>`create`: Current user favourites a status</p><p>`delete`: Current user deletes a favourite</p>

For the `data` structures of these events respectively please refer to the Fanfou [Streaming API](http://wiki.fanfou.com/Streaming-API) docs.

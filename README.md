# fanfou-sdk-node

[![](https://badges.greenkeeper.io/LitoMore/fanfou-sdk-node.svg)](https://greenkeeper.io/)
[![](https://img.shields.io/travis/LitoMore/fanfou-sdk-node/master.svg)](https://travis-ci.org/LitoMore/fanfou-sdk-node)
[![](https://img.shields.io/appveyor/ci/LitoMore/fanfou-sdk-node/master.svg)](https://ci.appveyor.com/project/LitoMore/fanfou-sdk-node)
[![](https://img.shields.io/npm/v/fanfou-sdk.svg)](https://www.npmjs.com/package/fanfou-sdk)
[![](https://img.shields.io/npm/l/fanfou-sdk.svg)](https://github.com/LitoMore/fanfou-sdk-node/blob/master/LICENSE)
[![](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/xojs/xo)

Fanfou SDK for Node.js

## Install

```bash
$ npm i fanfou-sdk
```

## Usage

```javascript
const Fanfou = require('fanfou-sdk');
```

**OAuth**

```javascript
const ff = new Fanfou({
  consumerKey: '',
  consumerSecret: '',
  oauthToken: '',
  oauthTokenSecret: ''
});

ff.get('/statuses/home_timeline', {format: 'html'})
  .then(res => console.log(res))
  .catch(res => console.log(err));
```

**XAuth**

```javascript
const ff = new Fanfou({
  consumerKey: '',
  consumerSecret: '',
  username: '',
  password: ''
});

ff.xauth()
  .then(res => {
    console.log(res);
    ff.get('/statuses/public_timeline', {count: 10})
      .then(res => console.log(res))
      .catch(err => console.log(err));

    ff.get('/statuses/update', {status: 'Hi Fanfou'})
      .then(res => console.log(res))
      .catch(err => console.log(err));
  })
  .catch(err => console.log(err));
```

> For more usages, see the [example](https://github.com/LitoMore/fanfou-sdk-node/blob/master/example.js).

**Options**

- `consumerKey`: The consumer key
- `consumerSecret`: The consumer secret
- `oauthToken`: The OAuth token
- `oauthTokenSecret`: The OAuth token secret
- `username`: The Fanfou username
- `password`: The Fanfou password
- `protocol`: Set the prototol, default is `http:`
- `apiDomain`: Set the API domain, default is `api.fanfou.com`
- `oauthDomain`: Set the OAuth domain, default is `fanfou.com`
- `hooks`: Hooks allow modifications with OAuth

> For more Fanfou API docs, see the [Fanfou API doc](https://github.com/FanfouAPI/FanFouAPIDoc/wiki).

## API

```javascript
ff.xauth();
ff.get(uri, params);
ff.post(uri, params);
```

**Examples**

```javascript
ff.get('/statuses/home_timeline', {})
  .then(res => console.log(res))
  .catch(err => console.log(err));

ff.post('/statuses/update', {status: 'post test'})
  .then(res => console.log(res))
  .catch(err => console.log(err));

ff.post('/photos/upload', {photo: fs.createReadStream(path), status: 'unicorn'})
  .then(res => console.log(res))
  .catch(err => console.log(err));
```

**Tips**

Use `hooks` for your reverse-proxy server

```javascript
const ff = new Fanfou({
  consumerKey: '',
  consumerSecret: '',
  oauthToken: '',
  oauthTokenSecret: '',
  apiDomain: 'api.example.com',
  oauthDomain: 'example.com',
  hooks: {
    baseString: str => {
      return str.replace('example.com', 'fanfou.com');
    }
  }
});
```

## TypeScript

**Example**

```typescript
import * as Fanfou from 'fanfou-sdk';

const opt: Fanfou.FanfouOptions = {
  consumerKey: '',
  consumerSecret: '',
  oauthToken: '',
  oauthTokenSecret: '',
};

const ff = new Fanfou(opt);

ff.post('/user_timeline', {count: 10});
```

For more declarations, see the [declaration file](https://github.com/LitoMore/fanfou-sdk-node/blob/master/index.d.ts).

## Related

- [nofan](https://github.com/LitoMore/nofan) - CLI for Fanfou
- [xiaofan](https://github.com/fanfoujs/xiaofan) - WeApp for Fanfou
- [fanfou-streamer](https://github.com/LitoMore/fanfou-streamer) - Fanfou Streaming SDK for Node.js
- [fanfou-sdk-browser](https://github.com/LitoMore/fanfou-sdk-browser) - Fanfou SDK for browser
- [fanfou-sdk-weapp](https://github.com/LitoMore/fanfou-sdk-weapp) - Fanfou SDK for WeApp
- [alfred-fanfou](https://github.com/LitoMore/alfred-fanfou) - Alfred 3 workflow for Fanfou
- [kap-fanfou](https://github.com/LitoMore/kap-fanfou) - Kap plugin that share on Fanfou
- [cerebro-fanfou](https://github.com/LitoMore/cerebro-fanfou) - A cerebro plugin for Fanfou
- [code-fanfou](https://github.com/LitoMore/code-fanfou) - A VS Code extension for Fanfou
- [bitbar-fanfou](https://github.com/LitoMore/bitbar-fanfou) - A BitBar plugin for Fanfou

## License

MIT © [LitoMore](https://github.com/LitoMore)

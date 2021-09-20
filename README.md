# fanfou-sdk-node

[![](https://github.com/fanfoujs/fanfou-sdk-node/workflows/Node/badge.svg)](https://github.com/fanfoujs/fanfou-sdk-node/actions)
[![](https://img.shields.io/npm/v/fanfou-sdk.svg)](https://www.npmjs.com/package/fanfou-sdk)
[![](https://img.shields.io/npm/l/fanfou-sdk.svg)](https://github.com/fanfoujs/fanfou-sdk-node/blob/master/LICENSE)
[![](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/xojs/xo)

Fanfou SDK for Node.js

## Install

```bash
$ npm i fanfou-sdk
```

---

<a href="https://www.patreon.com/LitoMore">
  <img src="https://c5.patreon.com/external/logo/become_a_patron_button@2x.png" width="160">
</a>

## Usage

```javascript
import Fanfou from 'fanfou-sdk';
```

**OAuth**

```javascript
const ff = new Fanfou({
  consumerKey: '',
  consumerSecret: '',
  oauthToken: '',
  oauthTokenSecret: ''
});

const timeline = await ff.getHomeTimeline();
```

**XAuth**

```javascript
const ff = new Fanfou({
  consumerKey: '',
  consumerSecret: '',
  username: '',
  password: ''
});

await ff.xauth();

const timeline = await ff.getPublicTimeline({count: 10});
const status = await ff.createStatus({status: 'Hi Fanfou'});
```

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

For full SDK API, please refer to the [documentation](https://fanfoujs.github.io/fanfou-sdk-node/modules.html).

**Examples**

```javascript
(async () => {
  // Get request token
  const token = await ff.getRequestToken();

  // Get access token
  const token = await ff.getAccessToken(token);

  // Get timeline
  const timeline = await ff.getHomeTimeline();

  // Post status
  const status = await ff.createStatus({status: 'post test'});

  // Upload photo
  const result = await ff.uploadPhoto({photo: fs.createReadStream(path), status: 'unicorn'});

  // Get user
  const user = await ff.getUser({id: 'lito'});

  // Request Fanfou API by passing the URI
  const timeline = ff.get('/statuses/home_timeline', {count: 10});
  const status = ff.post('/statuses/update', {status: 'Hi Fanfou'});
})();
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

## Related

- [nofan](https://github.com/LitoMore/nofan) - CLI for Fanfou
- [xiaofan](https://github.com/fanfoujs/xiaofan-wechat) - WeApp for Fanfou
- [fanfou-streamer](https://github.com/LitoMore/fanfou-streamer) - Fanfou Streaming SDK for Node.js
- [fanfou-sdk-browser](https://github.com/fanfoujs/fanfou-sdk-browser) - Fanfou SDK for browser
- [fanfou-sdk-deno](https://github.com/LitoMore/fanfou-sdk-deno) - Fanfou SDK for Deno
- [fanfou-sdk-weapp](https://github.com/fanfoujs/fanfou-sdk-weapp) - Fanfou SDK for WeApp
- [fanfou-sdk-python](https://github.com/LitoMore/fanfou-sdk-python) - Fanfou SDK for Python
- [alfred-fanfou](https://github.com/LitoMore/alfred-fanfou) - Alfred 3 workflow for Fanfou
- [kap-fanfou](https://github.com/LitoMore/kap-fanfou) - Kap plugin that share on Fanfou
- [cerebro-fanfou](https://github.com/LitoMore/cerebro-fanfou) - A cerebro plugin for Fanfou
- [code-fanfou](https://github.com/LitoMore/code-fanfou) - A VS Code extension for Fanfou
- [bitbar-fanfou](https://github.com/LitoMore/bitbar-fanfou) - A BitBar plugin for Fanfou

## License

MIT

var Fanfou = require('./../lib/fanfou');

var ff = new Fanfou(
  process.env.CONSUMER_KEY,
  process.env.CONSUMER_SECRET,
  process.env.OAUTH_TOKEN,
  process.env.OAUTH_TOKEN_SECRET
);

// GET test
ff.get('/favorites', {id: 'lito', count: 1}, function (e, res, timeline) {
  if (e) console.error(e);
  else {
    console.log('GET ok.')
  }
});

// POST test
ff.post('/statuses/update', {
  status: Math.random().toString(36).substr(2, 8),
  count: 1
}, function (e, res, status) {
  if (e) console.log(e);
  else {
    console.log('POST ok.')
  }
});

// Photo upload test
ff.upload(__dirname + '/img/parentheses.png', Math.random().toString(36).substr(2, 8), function (e, res, status) {
  if (e) console.error(e);
  else {
    console.log('Photo upload ok.');
  }
});

// Streaming test
let streamer = ff.stream();
streamer.on('connected', function () {
  console.log('Streaming connected.');
});

streamer.on('close', function () {
  console.log('Streaming disconnected.');
});

streamer.on('error', function (err) {
  console.log(err);
});

setTimeout(function () {
  streamer.stop()
}, 1000);

// XAuth test
ff.oauth.getXAuthAccessToken(
  process.env.FANFOU_USERNAME,
  process.env.FANFOU_PASSWORD,
  function (error, oauth_token, oauth_token_secret, result) {
    if (error) console.error(error);
    else {
      console.log('Get XAuth Access Token ok.');
      ff.oauth.oauth_token = oauth_token;
      ff.oauth.oauth_token_secret = oauth_token_secret;
      ff.get('/statuses/public_timeline', {count: 1}, function (e, res, timeline) {
        if (e) console.error(e);
        else console.log('Get public timeline by XAuth ok.');
      })
    }
  }
);

var Fanfou = require('./../lib/fanfou');

var ff = new Fanfou(
  process.env.CONSUMER_KEY,
  process.env.CONSUMER_SECRET,
  process.env.OAUTH_TOKEN,
  process.env.OAUTH_TOKEN_SECRET
);

ff.get('/favorites', {id: 'lito', count: 1}, function (e, res, timeline) {
  if (e) console.error(e);
  else {
    console.log(res);
    console.log(timeline)
  }
});

ff.post('/statuses/update', {
  status: Math.random().toString(36).substr(2, 8),
  count: 1
}, function (e, res, status) {
  if (e) console.log(e);
  else {
    console.log(res);
    console.log(status);
  }
});

ff.upload(__dirname + '/img/parentheses.png', Math.random().toString(36).substr(2, 8), function (e, res, status) {
  if (e) console.error(e);
  else {
    console.log(res);
    console.log(status);
  }
});

let streamer = ff.stream();
streamer.on('connected', function () {
  console.log('connected');
});

streamer.on('close', function () {
  console.log('disconnected');
});

streamer.on('error', function (err) {
  console.log(err);
});

setTimeout(function () {
  streamer.stop()
}, 1000);

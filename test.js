var Fanfou = require('./lib/fanfou');

var ff = new Fanfou(
  process.env.CONSUMER_KEY,
  process.env.CONSUMER_SECRET,
  process.env.OAUTH_TOKEN,
  process.env.OAUTH_TOKEN_SECRET
);

ff.get('/statuses/home_timeline', {id: 'lito', count: 2}, function (e, res, timeline) {
  if (e) console.error(e);
  else {
    console.log(res);
    console.log(timeline);
  }
});

ff.get('/followers/ids', {}, function (e, res) {
  if (e) console.error(e);
  else console.log(res);
});

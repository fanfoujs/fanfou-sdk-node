var Fanfou = require('fanfou-sdk');

var ff = new Fanfou(CONSUMER_KEY, CONSUMER_SECRET, OAUTH_TOKEN, OAUTH_TOKEN_SECRET);

ff.get('/statuses/home_timeline', {id: 'lito'}, function (e, res) {
  if (e) console.error(e);
  else console.log(res);
});

ff.post('/statuses/update', {status: 'test post'}, function (e, res) {
  if (e) console.error(e);
  else console.log(res);
});

ff.upload('/Users/litomore/Desktop/fanfou/color.png', '上传了新照片', function (e, res) {
  if (e) console.error(e);
  else console.log(res);
});

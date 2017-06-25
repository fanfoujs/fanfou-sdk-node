var Fanfou = require('./../lib/fanfou')
var fs = require('fs')

var ffOAuth = new Fanfou({
  auth_type: 'oauth',
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  oauth_token: process.env.OAUTH_TOKEN,
  oauth_token_secret: process.env.OAUTH_TOKEN_SECRET
})

// GET test
ffOAuth.get('/favorites', {id: 'lito', count: 1}, function (e, timeline) {
  if (e) console.error(e)
  else {
    console.log('GET ok.')
  }
})

// POST test
ffOAuth.post('/statuses/update', {
  status: Math.random().toString(36).substr(2, 8),
  count: 1
}, function (e, status) {
  if (e) console.log(e)
  else {
    console.log('POST ok.')
  }
})

// Photo upload test
ffOAuth.upload(
  fs.createReadStream(__dirname + '/img/parentheses.png'),
  Math.random().toString(36).substr(2, 8),
  function (e, res, status) {
    if (e) console.error(e)
    else {
      console.log('Photo upload ok.')
    }
  })

// Streaming test
let streamer = ffOAuth.stream()
streamer.on('connected', function () {
  console.log('Streaming connected.')
})

streamer.on('close', function () {
  console.log('Streaming disconnected.')
})

streamer.on('error', function (err) {
  console.log(err)
})

setTimeout(function () {
  streamer.stop()
}, 1000)

// XAuth test
var ffXAuth = new Fanfou({
  auth_type: 'xauth',
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  username: process.env.FANFOU_USERNAME,
  password: process.env.FANFOU_PASSWORD
})

ffXAuth.xauth(function (e, res) {
  if (e) console.error(e)
  else {
    ffXAuth.get('/statuses/public_timeline', {count: 1}, function (e, timeline) {
      if (e) console.log(e)
      else console.log('XAuth get public timeline ok.')
    })
  }
})

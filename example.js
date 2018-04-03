'use strict'

const Fanfou = require('.')

let {
  FANFOU_CONSUMER_KEY: consumerKey,
  FANFOU_CONSUMER_SECRET: consumerSecret,
  FANFOU_OAUTH_TOKEN: oauthToken,
  FANFOU_OAUTH_TOKEN_SECRET: oauthTokenSecret,
  FANFOU_USERNAME: username,
  FANFOU_PASSWORD: password
} = process.env

// ...psst! Fill the options below
// consumerKey = ''
// consumerSecret = ''
// oauthToken = ''
// oauthTokenSecret = ''
// username = ''
// password = ''

const callback = (err, res) => {
  if (err) console.log(err.message)
  else console.log(res.length, 'statuses.')
}

// camelCase options
const f1 = new Fanfou({
  consumerKey,
  consumerSecret,
  oauthToken,
  oauthTokenSecret
})
f1.get('/statuses/home_timeline', {count: 10}, callback)

// snake_case options
const f2 = new Fanfou({
  consumer_key: consumerKey,
  consumer_secret: consumerSecret,
  oauth_token: oauthToken,
  oauth_token_secret: oauthTokenSecret
})
f2.get('/statuses/home_timeline', {count: 5}, callback)

// HTTPS connection
const f3 = new Fanfou({
  consumerKey,
  consumerSecret,
  oauthToken,
  oauthTokenSecret,
  protocol: 'https:',
  fakeHttps: true
})
f3.get('/statuses/home_timeline', {count: 5}, callback)

// XAuth
const f4 = new Fanfou({
  authType: 'xauth',
  consumerKey,
  consumerSecret,
  username,
  password
})

f4.xauth(err => {
  if (err) console.log(err.message)
  else {
    f4.get('/statuses/home_timeline', {count: 5}, callback)
  }
})

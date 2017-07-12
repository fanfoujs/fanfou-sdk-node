const fs = require('fs')
const test = require('ava')
const path = require('path')
const Fanfou = require('../')
const {
  CONSUMER_KEY,
  CONSUMER_SECRET,
  OAUTH_TOKEN,
  OAUTH_TOKEN_SECRET,
  FANFOU_USERNAME,
  FANFOU_PASSWORD
} = process.env
const PULL_REQUEST_FROM_FORKED = !(CONSUMER_KEY && CONSUMER_SECRET && OAUTH_TOKEN && OAUTH_TOKEN_SECRET && FANFOU_USERNAME && FANFOU_PASSWORD)

const nonceText = Math.random().toString(36).substr(2, 5)

const oauth = () => {
  const ff = new Fanfou({
    auth_type: 'oauth',
    consumer_key: CONSUMER_KEY,
    consumer_secret: CONSUMER_SECRET,
    oauth_token: OAUTH_TOKEN,
    oauth_token_secret: OAUTH_TOKEN_SECRET
  })
  return ff
}

const xauth = () => {
  const ff = new Fanfou({
    auth_type: 'xauth',
    consumer_key: CONSUMER_KEY,
    consumer_secret: CONSUMER_SECRET,
    username: FANFOU_USERNAME,
    password: FANFOU_PASSWORD
  })
  return new Promise((resolve, reject) => {
    ff.xauth((err, res) => {
      if (err) resolve(err.message)
      else resolve(res)
    })
  })
}

const favorites = () => {
  const ff = oauth()
  return new Promise((resolve, reject) => {
    ff.get('/favorites', {id: 'testcase'}, (err, res) => {
      if (err) resolve(err.message)
      else resolve(res)
    })
  })
}

const update = () => {
  const ff = oauth()
  return new Promise((resolve, reject) => {
    ff.post('/statuses/update', {status: nonceText}, (err, res) => {
      if (err) resolve(err.message)
      else resolve(res)
    })
  })
}

const upload = () => {
  const ff = oauth()
  return new Promise((resolve, reject) => {
    ff.upload(
      fs.createReadStream(path.join(__dirname, '/img/parentheses.png')),
      nonceText + '-upload',
      (err, res) => {
        if (err) resolve(err.message)
        else resolve(res)
      }
    )
  })
}

test('oauth test', async t => {
  const ff = oauth()
  const should = PULL_REQUEST_FROM_FORKED ? [CONSUMER_KEY, CONSUMER_SECRET, '', ''] : [
    CONSUMER_KEY,
    CONSUMER_SECRET,
    OAUTH_TOKEN,
    OAUTH_TOKEN_SECRET
  ]
  t.deepEqual([
    ff.consumer_key,
    ff.consumer_secret,
    ff.oauth_token,
    ff.oauth_token_secret
  ], should)
})

test('xauth test', async t => {
  const results = await xauth()
  const should = PULL_REQUEST_FROM_FORKED ? 'Invalid consumer key' : {
    oauth_token: OAUTH_TOKEN,
    oauth_token_secret: OAUTH_TOKEN_SECRET
  }
  t.deepEqual(results, should)
})

test('GET /favorites', async t => {
  const {text} = (await favorites())[0]
  t.is(text, 'hi fanfou')
})

test('POST /statuses/update', async t => {
  const {text} = (await update())
  PULL_REQUEST_FROM_FORKED ? t.is(text, undefined) : t.is(text, nonceText)
})

test('POST /statuses/upload', async t => {
  const status = await upload()
  const hasPhoto = !!status.photo
  const {text} = status
  PULL_REQUEST_FROM_FORKED ? t.deepEqual([hasPhoto, text], [false, undefined]) : t.deepEqual([hasPhoto, text], [true, `${nonceText}-upload`])
})

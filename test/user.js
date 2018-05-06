const test = require('ava')
const User = require('../lib/user')
const Fanfou = require('..')

const {
  CONSUMER_KEY,
  CONSUMER_SECRET,
  OAUTH_TOKEN,
  OAUTH_TOKEN_SECRET
} = process.env

const ff = new Fanfou({
  consumer_key: CONSUMER_KEY,
  consumer_secret: CONSUMER_SECRET,
  oauth_token: OAUTH_TOKEN,
  oauth_token_secret: OAUTH_TOKEN_SECRET
})

const getUser = () => {
  return new Promise((resolve, reject) => {
    ff.get('/users/show', {id: 'testcase'}, (err, res) => {
      if (err) {
        reject(err)
      } else {
        resolve(res)
      }
    })
  })
}

test('user test', async t => {
  const res = await getUser()
  const user = new User(res)
  t.is(user.unique_id, '~VGXToPsjmjo')
})

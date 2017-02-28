'use strict';

var Fanfou = require('./../lib/fanfou');

var ff = new Fanfou(
  process.env.CONSUMER_KEY,
  process.env.CONSUMER_SECRET,
  process.env.OAUTH_TOKEN,
  process.env.OAUTH_TOKEN_SECRET
);

// To start a streamer
var streamer = ff.stream();

// Now post a new status on fanfou, this will trigger the 'message' event
streamer.on('message', function (data) {
  console.log(data.schema + ' ' + data.action + ': ' + data.object.text);
  // OUTPUT: message create: hello fanfou
});

// Listen to reply or mention events
streamer.on('message', function (data) {
  if (data.is_mentioned) {
    console.log('Is mentioned by @' + data.mentioned_by);
    // OUTPUT: Is mentioned by @fanfou
  }

  if (data.is_replied) {
    console.log('Is replied by @' + data.replied_by);
    // OUTPUT: Is replied by @fanfou
  }
});

// Or listen to the favourite events
streamer.on('fav', function (data) {
  console.log(data.schema + ' ' + data.action + ': ' + data.object.text);
});

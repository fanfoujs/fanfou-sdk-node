import test from 'ava';
import * as utils from '../source/index.js';
import {baseStatus} from './fixtures/mocks.js';

test('isReply', (t) => {
	t.false(utils.isReply(baseStatus));
	t.true(utils.isReply({...baseStatus, inReplyToStatusId: 'statusId'}));
	t.true(utils.isReply({...baseStatus, inReplyToUserId: 'statusId'}));
});

test('isRepost ', (t) => {
	t.false(utils.isRepost(baseStatus));
	t.false(utils.isRepost({...baseStatus, repostStatusId: ''}));
	t.true(utils.isRepost({...baseStatus, repostStatusId: 'statusId'}));
});

test('isOrigin', (t) => {
	t.true(utils.isOrigin(baseStatus));
	t.false(utils.isOrigin({...baseStatus, inReplyToStatusId: 'statusId'}));
	t.false(utils.isOrigin({...baseStatus, inReplyToUserId: 'statusId'}));
	t.false(utils.isOrigin({...baseStatus, repostStatusId: 'statusId'}));
});

test('isOriginRepost', (t) => {
	t.false(utils.isOriginRepost(baseStatus));
	t.true(utils.isOriginRepost({...baseStatus, text: 'text转@user'}));
});

test('getType', (t) => {
	t.is(utils.getType(baseStatus), 'origin');
	t.is(utils.getType({...baseStatus, inReplyToStatusId: 'statusId'}), 'reply');
	t.is(utils.getType({...baseStatus, repostStatusId: 'statusId'}), 'repost');
});

test('hasBold', (t) => {
	t.false(utils.hasBold('text'));
	t.true(utils.hasBold('<b>text</b>'));
});

test('removeBoldTag', (t) => {
	t.is(utils.removeBoldTag('text'), 'text');
	t.is(utils.removeBoldTag('<b>text</b>'), 'text');
});

test('getBoldTexts', (t) => {
	t.deepEqual(utils.getBoldTexts('&#xA9;'), [{text: '©', isBold: false}]);
	t.deepEqual(utils.getBoldTexts('<b></b>'), [{text: '', isBold: true}]);
	t.deepEqual(utils.getBoldTexts('a<b>b</b>c'), [
		{text: 'a', isBold: false},
		{text: 'b', isBold: true},
		{text: 'c', isBold: false},
	]);
});

test('getEntities', (t) => {
	t.deepEqual(utils.getEntities('text'), [{type: 'text', text: 'text'}]);
	t.deepEqual(
		utils.getEntities(
			'say some thing😭 转@' +
				'<a href="https://fanfou.com/user" class="former">username</a>' +
				' test string ' +
				'#<a href="/q/test">test</a>#' +
				' ok test ' +
				'<a href="https://does.not.exist" title="https://does.not.exist" rel="nofollow" target="_blank">https://does.not.exist</a>' +
				' test',
		),
		[
			{type: 'text', text: 'say some thing😭 转'},
			{type: 'at', text: '@username', name: 'username', id: 'user'},
			{type: 'text', text: ' test string '},
			{type: 'tag', text: '#test#', query: 'test'},
			{type: 'text', text: ' ok test '},
			{
				type: 'link',
				text: 'https://does.not.exist',
				link: 'https://does.not.exist',
			},
			{type: 'text', text: ' test'},
		],
	);
});

test('getSourceUrl', (t) => {
	t.is(
		utils.getSourceUrl(
			'<a href="https://does.not.exist" target="_blank">SDK</a>',
		),
		'https://does.not.exist',
	);
});

test('getSourceName', (t) => {
	t.is(
		utils.getSourceName(
			'<a href="https://does.not.exist" target="_blank">SDK</a>',
		),
		'SDK',
	);
});

test('getPlainText', (t) => {
	t.is(
		utils.getPlainText([
			{type: 'text', text: 'say some thing😭 转'},
			{type: 'at', text: '@username', name: 'username', id: 'user'},
			{type: 'text', text: ' test string '},
			{type: 'tag', text: '#test#', query: 'test'},
			{type: 'text', text: ' ok test '},
			{
				type: 'link',
				text: 'https://does.not.exist',
				link: 'https://does.not.exist',
			},
			{type: 'text', text: ' test'},
		]),
		'say some thing😭 转@username test string #test# ok test https://does.not.exist test',
	);
});

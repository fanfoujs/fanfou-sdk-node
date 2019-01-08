'use strict';

const he = require('he');
const User = require('./user');
const Photo = require('./photo');

class Status {
	constructor(status) {
		this.created_at = status.created_at;
		this.id = status.id;
		this.rawid = status.rawid;
		this.text = status.text;
		this.source = status.source;
		this.truncated = status.truncated;
		this.in_reply_to_status_id = status.in_reply_to_status_id;
		this.in_reply_to_user_id = status.in_reply_to_user_id;
		this.favorited = status.favorited;
		this.in_reply_to_screen_name = status.in_reply_to_screen_name;
		this.is_self = status.is_self;
		this.location = status.location;
		if (status.repost_status_id) {
			this.repost_status_id = status.repost_status_id;
		}
		if (status.repost_user_id) {
			this.repost_user_id = status.repost_user_id;
		}
		if (status.repost_screen_name) {
			this.repost_screen_name = status.repost_screen_name;
		}
		if (status.repost_status) {
			this.repost_status = new Status(status.repost_status);
		}
		if (status.user) {
			this.user = new User(status.user);
		}
		if (status.photo) {
			this.photo = new Photo(status.photo);
		}
		this.type = this._getType();
		this.source_url = this._getSourceUrl();
		this.source_name = this._getSourceName();
		this.txt = this._getTxt();
		this.plain_text = this._getPlainText();
	}

	isReply() {
		return this.in_reply_to_status_id !== '' || this.in_reply_to_user_id !== '';
	}

	isRepost() {
		return this.repost_status_id && this.repost_status_id !== '';
	}

	isOrigin() {
		return !(this.isReply() || this.isRepost());
	}

	isOriginRepost() {
		return this.isOrigin() && this.text.match(/转@/g);
	}

	_getType() {
		if (this.isReply()) {
			return 'reply';
		}
		if (this.isRepost()) {
			return 'repost';
		}
		if (this.isOrigin()) {
			return 'origin';
		}
		return 'unknown';
	}

	_getSourceUrl() {
		if (this.source.match(/<a href="(.+)" target="_blank">.+<\/a>/)) {
			return this.source.match(/<a href="(.+)" target="_blank">.+<\/a>/)[1];
		}
		return '';
	}

	_getSourceName() {
		if (this.source.match(/<a href=".+" target="_blank">(.+)<\/a>/)) {
			return this.source.match(/<a href=".+" target="_blank">(.+)<\/a>/)[1];
		}
		return this.source;
	}

	_getTxt() {
		const pattern = /[@#]?<a href="(.*?)".*?>([\s\S\n]*?)<\/a>#?/g;
		const match = this.text.match(pattern);
		const txt = [];
		let theText = this.text;
		if (match) {
			match.forEach(item => {
				const index = theText.indexOf(item);

				// Text
				if (index > 0) {
					const text = theText.substr(0, index);
					const originText = he.decode(Status._removeBoldTag(theText.substr(0, index)));
					const thisTxt = {
						type: 'text',
						text: originText,
						_text: originText.replace(/\n{3,}/g, '\n\n')
					};
					if (Status._hasBold(text)) {
						thisTxt.bold_arr = Status._getBoldArr(text);
					}
					txt.push(thisTxt);
				}

				// Tag
				if (item.substr(0, 1) === '#') {
					const matchText = item.match(/#<a href="\/q\/(.*?)".?>([\s\S\n]*)<\/a>#/);
					const text = `#${matchText[2]}#`;
					const originText = he.decode(Status._removeBoldTag(text));
					const thisTxt = {
						type: 'tag',
						text: originText,
						_text: originText.replace(/\n{2,}/g, '\n'),
						query: decodeURIComponent(he.decode(matchText[1]))
					};
					if (Status._hasBold(text)) {
						thisTxt.bold_arr = Status._getBoldArr(text);
					}
					txt.push(thisTxt);
				}

				// At
				if (item.substr(0, 1) === '@') {
					const matchText = item.match(/@<a href="(http|https):\/\/(?:[.a-z0-9-]*)fanfou.com\/(.*?)".*?>(.*?)<\/a>/);
					const text = `@${matchText[3]}`;
					const originText = he.decode(Status._removeBoldTag(text));
					const thisTxt = {
						type: 'at',
						text: originText,
						name: he.decode(matchText[3]),
						id: matchText[2]
					};
					if (Status._hasBold(text)) {
						thisTxt.bold_arr = Status._getBoldArr(text);
					}
					txt.push(thisTxt);
				}

				// Link
				if (item.substr(0, 1) === '<') {
					const matchText = item.match(/<a href="(.*?)".*?>(.*?)<\/a>/);
					const [, link, text] = matchText;
					const originText = Status._removeBoldTag(text);
					const thisTxt = {
						type: 'link',
						text: originText,
						link
					};
					if (Status._hasBold(text)) {
						thisTxt.bold_arr = Status._getBoldArr(text);
					}
					txt.push(thisTxt);
				}
				theText = theText.substr(index + item.length);
			});
			if (theText.length > 0) {
				const text = theText;
				const originText = he.decode(Status._removeBoldTag(text));
				const thisTxt = {
					type: 'text',
					text: originText,
					_text: originText.replace(/\n{3,}/g, '\n\n')
				};
				if (Status._hasBold(text)) {
					thisTxt.bold_arr = Status._getBoldArr(text);
				}
				txt.push(thisTxt);
			}
			return txt;
		}
		const text = theText;
		const originText = he.decode(Status._removeBoldTag(theText));
		const thisTxt = {
			type: 'text',
			text: originText,
			_text: originText.replace(/\n{3,}/g, '\n\n')
		};
		if (Status._hasBold(text)) {
			thisTxt.bold_arr = Status._getBoldArr(text);
		}
		return [thisTxt];
	}

	_getPlainText() {
		let text = '';
		this.txt.forEach(t => {
			text += t.text;
		});
		return he.decode(text);
	}

	static _hasBold(text) {
		return text.match(/<b>[\s\S\n]*?<\/b>/g);
	}

	static _getBoldArr(text) {
		const pattern = /<b>[\s\S\n]*?<\/b>/g;
		let theText = text;
		const match = text.match(pattern);
		const textArr = [];
		if (match) {
			match.forEach(item => {
				const index = theText.indexOf(item);
				if (index > 0) {
					const t = theText.substr(0, index);
					textArr.push({
						text: he.decode(t),
						bold: false
					});
				}
				const [, t] = item.match(/<b>([\s\S\n]*?)<\/b>/);
				textArr.push({
					text: he.decode(t),
					bold: true
				});
				theText = theText.substr(index + item.length);
			});
			if (theText.length > 0) {
				textArr.push({
					text: he.decode(theText),
					bold: false
				});
			}
			return textArr;
		}
		return [{
			text: he.decode(text),
			bold: false
		}];
	}

	static _removeBoldTag(text) {
		return text.replace(/<b>/g, '').replace(/<\/b>/g, '');
	}
}

module.exports = Status;

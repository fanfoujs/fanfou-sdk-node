import he from 'he';
import User from './user.js';
import Photo from './photo.js';

export type TextEntity = {
	type: 'text';
	text: string;
	bold_arr?: Array<{text: string; bold: boolean}>;
};

export type TagEntity = {
	type: 'tag';
	text: string;
	query: string;
	bold_arr?: Array<{text: string; bold: boolean}>;
};

export type AtEntity = {
	type: 'at';
	text: string;
	name: string;
	id: string;
	bold_arr?: Array<{text: string; bold: boolean}>;
};

export type LinkEntity = {
	type: 'link';
	text: string;
	link: string;
	bold_arr?: Array<{text: string; bold: boolean}>;
};

export type Entity = TextEntity | TagEntity | AtEntity | LinkEntity;

class Status {
	created_at: string;
	id: string;
	rawid: number;
	text: string;
	source: string;
	truncated: boolean;
	in_reply_to_status_id?: string;
	in_reply_to_user_id?: string;
	in_reply_to_screen_name?: string;
	favorited: boolean;
	is_self: boolean;
	location: string;
	repost_status?: Status;
	repost_status_id?: string;
	repost_user_id?: string;
	repost_screen_name?: string;
	type: string;
	source_url?: string;
	source_name?: string;
	plain_text?: string;
	user?: User;
	photo?: Photo;
	entities?: Entity[];

	constructor(status: Status) {
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
		this.source_url = this.getSourceUrl();
		this.source_name = this.getSourceName();
		this.entities = this.getEntities();
		this.plain_text = this.getPlainText();
	}

	private static hasBold(text: string) {
		return /<b>[\s\S\n]*?<\/b>/g.test(text);
	}

	private static getBoldArr(text: string) {
		const pattern = /<b>[\s\S\n]*?<\/b>/g;
		let theText = text;
		const match = text.match(pattern);
		const textArray = [];
		if (match) {
			for (const item of match) {
				const index = theText.indexOf(item);
				if (index > 0) {
					const t = theText.slice(0, index);
					textArray.push({
						text: he.decode(t),
						bold: false
					});
				}

				const match = /<b>(?<t>[\s\S\n]*?)<\/b>/.exec(item) ?? {
					groups: {t: ''}
				};
				textArray.push({
					// eslint-disable-next-line @typescript-eslint/dot-notation
					text: he.decode(match.groups?.['t'] ?? ''),
					bold: true
				});
				theText = theText.slice(index + item.length);
			}

			if (theText.length > 0) {
				textArray.push({
					text: he.decode(theText),
					bold: false
				});
			}

			return textArray;
		}

		return [
			{
				text: he.decode(text),
				bold: false
			}
		];
	}

	private static _removeBoldTag(text: string) {
		return text.replace(/<b>/g, '').replace(/<\/b>/g, '');
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

	private getSourceUrl() {
		const matched = /<a href="(?<link>.*)" target="_blank">.+<\/a>/.exec(
			this.source
		);
		// eslint-disable-next-line @typescript-eslint/dot-notation
		return matched ? matched.groups?.['link'] : '';
	}

	private getSourceName() {
		const matched = /<a href=".*" target="_blank">(?<name>.+)<\/a>/.exec(
			this.source
		);
		// eslint-disable-next-line @typescript-eslint/dot-notation
		return matched ? matched.groups?.['name'] : this.source;
	}

	private getEntities(): Entity[] {
		const pattern = /[@#]?<a href=".*?".*?>[\s\S\n]*?<\/a>#?/g;
		const tagPattern = /#<a href="\/q\/(?<link>.*?)".?>(?<tag>[\s\S\n]*)<\/a>#/;
		const atPattern = /@<a href="(?:http|https):\/\/[.a-z\d-]*fanfou.com\/(?<id>.*?)".*?>(?<at>.*?)<\/a>/;
		const linkPattern = /<a href="(?<link>.*?)".*?>(?<text>.*?)<\/a>/;
		const match = this.text.match(pattern);
		const entities = [];
		let theText = this.text;
		if (match) {
			for (const item of match) {
				const index = theText.indexOf(item);

				// Text
				if (index > 0) {
					const text = theText.slice(0, index);
					const originText = he.decode(
						Status._removeBoldTag(theText.slice(0, index))
					);
					const thisEntity: Entity = {
						type: 'text',
						text: originText
					};
					if (Status.hasBold(text)) {
						thisEntity.bold_arr = Status.getBoldArr(text);
					}

					entities.push(thisEntity);
				}

				// Tag
				if (item.startsWith('#') && tagPattern.test(item)) {
					const matchText = tagPattern.exec(item) ?? {
						groups: {tag: '', link: ''}
					};
					const text = `#${matchText.groups?.tag!}#`;
					const originText = he.decode(Status._removeBoldTag(text));
					const thisEntity: Entity = {
						type: 'tag',
						text: originText,
						query: decodeURIComponent(he.decode(matchText.groups?.link ?? ''))
					};
					if (Status.hasBold(text)) {
						thisEntity.bold_arr = Status.getBoldArr(text);
					}

					entities.push(thisEntity);
				}

				// At
				if (item.startsWith('@') && atPattern.test(item)) {
					const matchText = atPattern.exec(item) ?? {groups: {at: '', id: ''}};
					const text = `@${matchText.groups?.at!}`;
					const originText = he.decode(Status._removeBoldTag(text));
					const thisEntity: Entity = {
						type: 'at',
						text: originText,
						name: he.decode(matchText.groups?.at ?? ''),
						id: matchText.groups?.id ?? ''
					};
					if (Status.hasBold(text)) {
						thisEntity.bold_arr = Status.getBoldArr(text);
					}

					entities.push(thisEntity);
				}

				// Link
				if (item.startsWith('<') && linkPattern.test(item)) {
					const matchText = linkPattern.exec(item) ?? {
						groups: {link: '', text: ''}
					};
					const link = matchText.groups?.link ?? '';
					const text = matchText.groups?.text ?? '';
					const originText = Status._removeBoldTag(text);
					const thisEntity: Entity = {
						type: 'link',
						text: originText,
						link
					};
					if (Status.hasBold(text)) {
						thisEntity.bold_arr = Status.getBoldArr(text);
					}

					entities.push(thisEntity);
				}

				theText = theText.slice(index + item.length);
			}

			if (theText.length > 0) {
				const text = theText;
				const originText = he.decode(Status._removeBoldTag(text));
				const thisEntity: Entity = {
					type: 'text',
					text: originText
				};
				if (Status.hasBold(text)) {
					thisEntity.bold_arr = Status.getBoldArr(text);
				}

				entities.push(thisEntity);
			}

			return entities;
		}

		const text = theText;
		const originText = he.decode(Status._removeBoldTag(theText));
		const thisEntity: Entity = {
			type: 'text',
			text: originText
		};
		if (Status.hasBold(text)) {
			thisEntity.bold_arr = Status.getBoldArr(text);
		}

		return [thisEntity];
	}

	private getPlainText() {
		let text = '';
		for (const t of this.entities ?? []) {
			text += t.text;
		}

		return he.decode(text);
	}
}

export default Status;

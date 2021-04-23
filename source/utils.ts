import he from 'he';
import Fanfou from './fanfou.js';
import Status, {StatusBoldText, StatusEntity} from './status.js';
import User from './user.js';
import Trend from './trend.js';
import DirectMessage from './direct-message.js';

export const uriType = (uri: string) => {
	const uriList = {
		// Timeline
		'/search/public_timeline': 'timeline',
		'/search/user_timeline': 'timeline',
		'/photos/user_timeline': 'timeline',
		'/statuses/friends_timeline': 'timeline',
		'/statuses/home_timeline': 'timeline',
		'/statuses/public_timeline': 'timeline',
		'/statuses/replies': 'timeline',
		'/statuses/user_timeline': 'timeline',
		'/statuses/context_timeline': 'timeline',
		'/statuses/mentions': 'timeline',
		'/favorites': 'timeline',

		// Status
		'/statuses/update': 'status',
		'/statuses/show': 'status',
		'/favorites/destroy': 'status',
		'/favorites/create': 'status',
		'/photos/upload': 'status',

		// Users
		'/users/tagged': 'users',
		'/users/followers': 'users',
		'/users/friends': 'users',
		'/friendships/requests': 'users',

		// User
		'/users/show': 'user',
		'/friendships/create': 'user',
		'/friendships/destroy': 'user',
		'/account/verify_credentials': 'user',

		// Conversation
		'/direct_messages/conversation': 'conversation',
		'/direct_messages/inbox': 'conversation',
		'/direct_messages/sent': 'conversation',

		// Conversation List
		'/direct_messages/conversation_list': 'conversation-list',

		// Direct Message
		'/direct_messages/new': 'dm',
		'/direct_messages/destroy': 'dm',

		// Saved Search
		'/saved_searches/create': 'saved-search',
		'/saved_searches/destroy': 'saved-search',
		'/saved_searches/show': 'saved-search',

		// Saved Search List
		'/saved_searches/list': 'saved-search-list',

		// Trend List
		'/trends/list': 'trend-list'
	};

	// @ts-expect-error
	const type = uriList[uri] || null;
	if (!type && /^\/favorites\/(?:create|destroy)\/.+/.test(uri)) {
		return 'status';
	}

	return type;
};

export const parseList = (ff: Fanfou, list: any, type: string) => {
	switch (type) {
		case 'timeline':
			return list.map((item: any) =>
				item instanceof Status ? item : new Status(ff, item)
			);
		case 'users':
			return list.map((item: any) =>
				item instanceof User ? item : new User(ff, item)
			);
		case 'conversation':
			return list.map((item: any) =>
				item instanceof DirectMessage ? item : new DirectMessage(ff, item)
			);
		case 'conversation-list':
			return list.map((item: any) => {
				item.dm =
					item.dm instanceof DirectMessage
						? item.dm
						: new DirectMessage(ff, item.dm);
				return item;
			});
		case 'saved-search-list':
			return list.map((item: any) =>
				item instanceof Trend ? item : new Trend(ff, item)
			);
		case 'trend-list': {
			list.trends = list.trends.map((item: any) =>
				item instanceof Trend ? item : new Trend(ff, item)
			);
			return list;
		}

		default:
			return list;
	}
};

export const parseData = (ff: Fanfou, data: any, type: string) => {
	switch (type) {
		case 'timeline':
		case 'users':
		case 'conversation':
		case 'conversation-list':
		case 'saved-search-list':
		case 'trend-list':
			return parseList(ff, data, type);
		case 'status':
			return data instanceof Status ? data : new Status(ff, data);
		case 'user':
			return data instanceof User ? data : new User(ff, data);
		case 'dm':
			return data instanceof DirectMessage ? data : new DirectMessage(ff, data);
		case 'saved-search':
			return data instanceof Trend ? data : new Trend(ff, data);
		default:
			return data;
	}
};

export const hasBold = (text: string) => {
	return /<b>[\s\S\n]*?<\/b>/g.test(text);
};

export const removeBoldTag = (text: string) => {
	return text.replace(/<b>/g, '').replace(/<\/b>/g, '');
};

export const getBoldTexts = (text: string): StatusBoldText[] => {
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
					isBold: false
				});
			}

			const match = /<b>(?<t>[\s\S\n]*?)<\/b>/.exec(item) ?? {
				groups: {t: ''}
			};
			textArray.push({
				// eslint-disable-next-line @typescript-eslint/dot-notation
				text: he.decode(match.groups?.['t'] ?? ''),
				isBold: true
			});
			theText = theText.slice(index + item.length);
		}

		if (theText.length > 0) {
			textArray.push({
				text: he.decode(theText),
				isBold: false
			});
		}

		return textArray;
	}

	return [
		{
			text: he.decode(text),
			isBold: false
		}
	];
};

export const getEntities = (statusText: string): StatusEntity[] => {
	const pattern = /[@#]?<a href=".*?".*?>[\s\S\n]*?<\/a>#?/g;
	const tagPattern = /#<a href="\/q\/(?<link>.*?)".?>(?<tag>[\s\S\n]*)<\/a>#/;
	const atPattern = /@<a href="(?:http|https):\/\/[.a-z\d-]*fanfou.com\/(?<id>.*?)".*?>(?<at>.*?)<\/a>/;
	const linkPattern = /<a href="(?<link>.*?)".*?>(?<text>.*?)<\/a>/;
	const match = statusText.match(pattern);
	const entities = [];
	let theText = statusText;
	if (match) {
		for (const item of match) {
			const index = theText.indexOf(item);

			// Text
			if (index > 0) {
				const text = theText.slice(0, index);
				const originText = he.decode(removeBoldTag(theText.slice(0, index)));
				const thisEntity: StatusEntity = {
					type: 'text',
					text: originText
				};
				if (hasBold(text)) {
					thisEntity.boldTexts = getBoldTexts(text);
				}

				entities.push(thisEntity);
			}

			// Tag
			if (item.startsWith('#') && tagPattern.test(item)) {
				const matchText = tagPattern.exec(item) ?? {
					groups: {tag: '', link: ''}
				};
				const text = `#${matchText.groups?.tag!}#`;
				const originText = he.decode(removeBoldTag(text));
				const thisEntity: StatusEntity = {
					type: 'tag',
					text: originText,
					query: decodeURIComponent(he.decode(matchText.groups?.link ?? ''))
				};
				if (hasBold(text)) {
					thisEntity.boldTexts = getBoldTexts(text);
				}

				entities.push(thisEntity);
			}

			// At
			if (item.startsWith('@') && atPattern.test(item)) {
				const matchText = atPattern.exec(item) ?? {groups: {at: '', id: ''}};
				const text = `@${matchText.groups?.at!}`;
				const originText = he.decode(removeBoldTag(text));
				const thisEntity: StatusEntity = {
					type: 'at',
					text: originText,
					name: he.decode(matchText.groups?.at ?? ''),
					id: matchText.groups?.id ?? ''
				};
				if (hasBold(text)) {
					thisEntity.boldTexts = getBoldTexts(text);
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
				const originText = removeBoldTag(text);
				const thisEntity: StatusEntity = {
					type: 'link',
					text: originText,
					link
				};
				if (hasBold(text)) {
					thisEntity.boldTexts = getBoldTexts(text);
				}

				entities.push(thisEntity);
			}

			theText = theText.slice(index + item.length);
		}

		if (theText.length > 0) {
			const text = theText;
			const originText = he.decode(removeBoldTag(text));
			const thisEntity: StatusEntity = {
				type: 'text',
				text: originText
			};
			if (hasBold(text)) {
				thisEntity.boldTexts = getBoldTexts(text);
			}

			entities.push(thisEntity);
		}

		return entities;
	}

	const text = theText;
	const originText = he.decode(removeBoldTag(theText));
	const thisEntity: StatusEntity = {
		type: 'text',
		text: originText
	};
	if (hasBold(text)) {
		thisEntity.boldTexts = getBoldTexts(text);
	}

	return [thisEntity];
};

export const getSourceUrl = (source: string) => {
	const matched = /<a href="(?<link>.*)" target="_blank">.+<\/a>/.exec(source);
	// eslint-disable-next-line @typescript-eslint/dot-notation
	return matched?.groups?.['link'] ?? '';
};

export const getSourceName = (source: string) => {
	const matched = /<a href=".*" target="_blank">(?<name>.+)<\/a>/.exec(source);
	// eslint-disable-next-line @typescript-eslint/dot-notation
	return matched?.groups?.['name'] ?? source;
};

export const getPlainText = (entities: StatusEntity[]) => {
	let text = '';
	for (const t of entities ?? []) {
		text += t.text;
	}

	return he.decode(text);
};

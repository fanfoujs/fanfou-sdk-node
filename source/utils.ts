import he from 'he';
import {Status, StatusBoldText, StatusEntity} from './types.js';

export const isReply = (status: Status) =>
	status.inReplyToStatusId !== '' || status.inReplyToUserId !== '';

export const isRepost = (status: Status) =>
	status.repostStatusId && status.repostStatusId !== '';

export const isOrigin = (status: Status) =>
	!(isReply(status) || isRepost(status));

export const isOriginRepost = (status: Status) =>
	isOrigin(status) && /转@/g.test(status.text);

export const getType = (status: Status) => {
	if (isReply(status)) {
		return 'reply';
	}

	if (isRepost(status)) {
		return 'repost';
	}

	if (isOrigin(status)) {
		return 'origin';
	}

	return 'unknown';
};

export const hasBold = (text: string) => /<b>[\s\S\n]*?<\/b>/g.test(text);

export const removeBoldTag = (text: string) =>
	text.replace(/<b>/g, '').replace(/<\/b>/g, '');

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
					isBold: false,
				});
			}

			const match = /<b>(?<t>[\s\S\n]*?)<\/b>/.exec(item);
			textArray.push({
				text: he.decode(match?.groups?.['t'] ?? ''),
				isBold: true,
			});
			theText = theText.slice(index + item.length);
		}

		if (theText.length > 0) {
			textArray.push({
				text: he.decode(theText),
				isBold: false,
			});
		}

		return textArray;
	}

	return [
		{
			text: he.decode(text),
			isBold: false,
		},
	];
};

export const getEntities = (statusText: string): StatusEntity[] => {
	const pattern = /[@#]?<a href=".*?".*?>[\s\S\n]*?<\/a>#?/g;
	const tagPattern = /#<a href="\/q\/(?<link>.*?)".?>(?<tag>[\s\S\n]*)<\/a>#/;
	const atPattern =
		/@<a href="(?:http|https):\/\/[.a-z\d-]*fanfou.com\/(?<id>.*?)".*?>(?<at>.*?)<\/a>/;
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
					text: originText,
				};
				if (hasBold(text)) {
					thisEntity.boldTexts = getBoldTexts(text);
				}

				entities.push(thisEntity);
			}

			// Tag
			if (item.startsWith('#') && tagPattern.test(item)) {
				const matchText = tagPattern.exec(item);
				const text = matchText?.groups?.['tag']
					? `#${matchText.groups['tag']}#`
					: '';
				const originText = he.decode(removeBoldTag(text));
				const thisEntity: StatusEntity = {
					type: 'tag',
					text: originText,
					query: decodeURIComponent(
						he.decode(matchText?.groups?.['link'] ?? ''),
					),
				};
				if (hasBold(text)) {
					thisEntity.boldTexts = getBoldTexts(text);
				}

				entities.push(thisEntity);
			}

			// At
			if (item.startsWith('@') && atPattern.test(item)) {
				const matchText = atPattern.exec(item);
				const text = matchText?.groups?.['at']
					? `@${matchText.groups['at']}`
					: '';
				const originText = he.decode(removeBoldTag(text));
				const thisEntity: StatusEntity = {
					type: 'at',
					text: originText,
					name: he.decode(matchText?.groups?.['at'] ?? ''),
					id: matchText?.groups?.['id'] ?? '',
				};
				if (hasBold(text)) {
					thisEntity.boldTexts = getBoldTexts(text);
				}

				entities.push(thisEntity);
			}

			// Link
			if (item.startsWith('<') && linkPattern.test(item)) {
				const matchText = linkPattern.exec(item);
				const link = matchText?.groups?.['link'] ?? '';
				const text = matchText?.groups?.['text'] ?? '';
				const originText = removeBoldTag(text);
				const thisEntity: StatusEntity = {
					type: 'link',
					text: originText,
					link,
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
				text: originText,
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
		text: originText,
	};
	if (hasBold(text)) {
		thisEntity.boldTexts = getBoldTexts(text);
	}

	return [thisEntity];
};

export const getSourceUrl = (source: string) => {
	const matched = /<a href="(?<link>.*)" target="_blank">.+<\/a>/.exec(source);
	return matched?.groups?.['link'] ?? '';
};

export const getSourceName = (source: string) => {
	const matched = /<a href=".*" target="_blank">(?<name>.+)<\/a>/.exec(source);
	return matched?.groups?.['name'] ?? source;
};

export const getPlainText = (entities: StatusEntity[]) => {
	let text = '';
	for (const t of entities ?? []) {
		text += t.text;
	}

	return he.decode(text);
};

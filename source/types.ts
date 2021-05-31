export type StatusBoldText = {
	text: string;
	isBold: boolean;
};

export type StatusEntityText = {
	type: 'text';
	text: string;
	boldTexts?: StatusBoldText[];
};

export type StatusEntityTag = {
	type: 'tag';
	text: string;
	query: string;
	boldTexts?: StatusBoldText[];
};

export type StatusEntityAt = {
	type: 'at';
	text: string;
	name: string;
	id: string;
	boldTexts?: StatusBoldText[];
};

export type StatusEntityLink = {
	type: 'link';
	text: string;
	link: string;
	boldTexts?: StatusBoldText[];
};

export type StatusEntity =
	| StatusEntityText
	| StatusEntityTag
	| StatusEntityAt
	| StatusEntityLink;

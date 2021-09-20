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

export type Status = {
	createdAt: string;
	id: string;
	rawid: number;
	text: string;
	source: string;
	truncated: boolean;
	favorited: boolean;
	inReplyToStatusId?: string;
	inReplyToUserId?: string;
	inReplyToScreenName?: string;
	inReplyToLastmsgId?: string;
	isSelf?: boolean;
	location?: string;
	repostStatus?: Status;
	repostStatusId?: string;
	repostUserId?: string;
	repostScreenName?: string;
	user?: User;
	photo?: Photo;
};

export type User = {
	id: string;
	name: string;
	screenName: string;
	uniqueId: string;
	location: string;
	gender: string;
	birthday: string;
	description: string;
	profileImageUrl: string;
	profileImageUrlLarge: string;
	url: string;
	protected: boolean;
	followersCount: number;
	friendsCount: number;
	favouritesCount: number;
	statusesCount: number;
	photoCount: number;
	following: boolean;
	notifications: boolean;
	createdAt: string;
	utcOffset: number;
	profileBackgroundColor?: string;
	profileTextColor?: string;
	profileLinkColor?: string;
	profileSidebarFillColor?: string;
	profileSidebarBorderColor?: string;
	profileBackgroundImageUrl?: string;
	profileBackgroundTile?: boolean;
	status?: Status;
};

export type DirectMessage = {
	id: string;
	text: string;
	senderId: string;
	recipientId: string;
	createdAt: string;
	senderScreenName: string;
	recipientScreenName: string;
	sender: User;
	recipient: User;
	inReplyTo?: DirectMessage;
};

export type Photo = {
	url: string;
	imageurl: string;
	thumburl: string;
	largeurl: string;
};

export type Trend = {
	id: number;
	query: string;
	name: string;
	createdAt: string;
};

import Fanfou from './fanfou.js';
import * as api from './api.js';
import User from './user.js';
import Photo from './photo.js';
import {
	getEntities,
	getSourceUrl,
	getSourceName,
	getPlainText
} from './utils.js';

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

export type StatusReplyOptions = api.CreateStatusOptions;

export type StatusRepostOptions = api.CreateStatusOptions;

export type StatusFavoriteOptions = {
	id?: string;
	mode?: api.APIMode;
	format?: api.APIFormat;
	callback?: string;
};

export type StatusUnfavoriteOptions = {
	id?: string;
	mode?: api.APIMode;
	format?: api.APIFormat;
};

export type StatusDestroyOptions = {
	id?: string;
	mode?: api.APIMode;
	format?: api.APIFormat;
	callback?: string;
};

export type StatusContextOptions = {
	id?: string;
	mode?: api.APIMode;
	format?: api.APIFormat;
	callback?: string;
};

class Status {
	createdAt: string;
	id: string;
	rawid: number;
	text: string;
	source: string;
	truncated: boolean;
	inReplyToStatusId?: string;
	inReplyToUserId?: string;
	inReplyToScreenName?: string;
	inReplyToLastmsgId?: string;
	favorited: boolean;
	isSelf?: boolean;
	location?: string;
	repostStatus?: Status;
	repostStatusId?: string;
	repostUserId?: string;
	repostScreenName?: string;
	type?: string;
	sourceUrl?: string;
	sourceName?: string;
	plainText?: string;
	user?: User;
	photo?: Photo;
	entities?: StatusEntity[];
	private readonly ff: Fanfou;

	constructor(ff: Fanfou, status: any) {
		this.ff = ff;
		this.createdAt = status.createdAt;
		this.id = status.id;
		this.rawid = status.rawid;
		this.text = status.text;
		this.source = status.source;
		this.truncated = status.truncated;
		this.favorited = status.favorited;

		if (status.inReplyToStatusId) {
			this.inReplyToStatusId = status.inReplyToStatusId;
		}

		if (status.inReplyToUserId) {
			this.inReplyToUserId = status.inReplyToUserId;
		}

		if (status.inReplyToScreenName) {
			this.inReplyToScreenName = status.inReplyToScreenName;
		}

		if (status.isSelf) {
			this.isSelf = status.isSelf;
		}

		if (status.location) {
			this.location = status.location;
		}

		if (status.repostStatusId) {
			this.repostStatusId = status.repostStatusId;
		}

		if (status.repostUserId) {
			this.repostUserId = status.repostUserId;
		}

		if (status.repostScreenName) {
			this.repostScreenName = status.repostScreenName;
		}

		if (status.repostStatus) {
			this.repostStatus =
				status.repostStatus instanceof Status
					? status.repostStatus
					: new Status(ff, status.repostStatus);
		}

		if (status.user) {
			this.user =
				status.user instanceof User ? status.user : new User(ff, status.user);
		}

		if (status.photo) {
			this.photo =
				status.photo instanceof Photo ? status.photo : new Photo(status.photo);
		}

		this.type = this.getType();
		this.sourceUrl = getSourceUrl(status.source);
		this.sourceName = getSourceName(status.source);
		this.entities = getEntities(status.text);
		this.plainText = getPlainText(this.entities);
	}

	isReply() {
		return this.inReplyToStatusId !== '' || this.inReplyToUserId !== '';
	}

	isRepost() {
		return this.repostStatusId && this.repostStatusId !== '';
	}

	isOrigin() {
		return !(this.isReply() || this.isRepost());
	}

	isOriginRepost() {
		return this.isOrigin() && this.text.match(/转@/g);
	}

	reply = async (options: StatusReplyOptions) =>
		api.createStatus(this.ff, {
			inReplyToStatusId: this.id,
			...options
		});

	repost = async (options?: StatusRepostOptions) =>
		api.createStatus(this.ff, {
			repostStatusId: this.id,
			status: options?.status ?? '',
			...options
		});

	favorite = async (options?: StatusFavoriteOptions) =>
		api.createFavorite(this.ff, {
			id: this.id,
			...options
		});

	unfavorite = async (options?: StatusUnfavoriteOptions) =>
		api.dropFavorite(this.ff, {
			id: this.id,
			...options
		});

	destroy = async (options?: StatusDestroyOptions) =>
		api.dropStatus(this.ff, {
			id: this.id,
			...options
		});

	context = async (options?: StatusContextOptions) =>
		api.getContextTimeline(this.ff, {
			id: this.id,
			...options
		});

	private getType() {
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
}

export default Status;

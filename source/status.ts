import Fanfou from './index.js';
import * as api from './api.js';
import User from './user.js';
import Photo from './photo.js';
import {
	getEntities,
	getSourceUrl,
	getSourceName,
	getPlainText
} from './utils.js';

export type BoldText = {
	text: string;
	isBold: boolean;
};

export type TextEntity = {
	type: 'text';
	text: string;
	boldTexts?: BoldText[];
};

export type TagEntity = {
	type: 'tag';
	text: string;
	query: string;
	boldTexts?: BoldText[];
};

export type AtEntity = {
	type: 'at';
	text: string;
	name: string;
	id: string;
	boldTexts?: BoldText[];
};

export type LinkEntity = {
	type: 'link';
	text: string;
	link: string;
	boldTexts?: BoldText[];
};

export type Entity = TextEntity | TagEntity | AtEntity | LinkEntity;

type FavoriteOptions = {
	id?: string;
	mode?: api.Mode;
	format?: api.Format;
	callback?: string;
};

type DestroyOptions = {
	id?: string;
	mode?: api.Mode;
	format?: api.Format;
	callback?: string;
};

type ContextOptions = {
	id?: string;
	mode?: api.Mode;
	format?: api.Format;
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
	entities?: Entity[];
	private readonly ff: Fanfou;

	constructor(ff: Fanfou, status: Status) {
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

	reply = async (options: api.CreateStatusOptions) =>
		api.createStatus(this.ff, {
			inReplyToStatusId: this.id,
			...options
		});

	repost = async (options?: api.CreateStatusOptions) =>
		api.createStatus(this.ff, {
			repostStatusId: this.id,
			status: options?.status ?? '',
			...options
		});

	favorite = async (options?: FavoriteOptions) =>
		api.createFavorite(this.ff, {
			id: this.id,
			...options
		});

	destroy = async (options?: DestroyOptions) =>
		api.dropStatus(this.ff, {
			id: this.id,
			...options
		});

	context = async (options?: ContextOptions) =>
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

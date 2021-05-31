import {
	getEntities,
	getSourceUrl,
	getSourceName,
	getPlainText
} from './utils.js';

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

	constructor(status: any) {
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
					: new Status(status.repostStatus);
		}

		if (status.user) {
			this.user =
				status.user instanceof User ? status.user : new User(status.user);
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

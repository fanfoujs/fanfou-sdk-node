import Fanfou from './fanfou.js';
import * as api from './api.js';
import User from './user.js';

export type DirectMessageReplyOptions = {
	text: string;
	user?: string;
	inReplyToId?: string;
	mode?: api.APIMode;
	callback?: string;
};

export type DirectMessageDestroyOptions = {
	id?: string;
	callback?: string;
};

class DirectMessage {
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
	private readonly ff: Fanfou;

	constructor(ff: Fanfou, dm: any) {
		this.ff = ff;
		this.id = dm.id;
		this.text = dm.text;
		this.senderId = dm.senderId;
		this.recipientId = dm.recipientId;
		this.createdAt = dm.createdAt;
		this.senderScreenName = dm.senderScreenName;
		this.recipientScreenName = dm.recipientScreenName;
		this.sender =
			dm.sender instanceof User ? dm.sender : new User(ff, dm.sender);
		this.recipient =
			dm.recipient instanceof User ? dm.recipient : new User(ff, dm.recipient);

		if (dm.inReplyTo) {
			this.inReplyTo =
				dm.inReplyTo instanceof DirectMessage
					? dm.inReplyTo
					: new DirectMessage(ff, dm.inReplyTo);
		}
	}

	reply = async (options: DirectMessageReplyOptions) =>
		api.createDirectMessage(this.ff, {
			user: this.senderId,
			inReplyToId: this.id,
			...options
		});

	destroy = async (options?: DirectMessageDestroyOptions) =>
		api.dropDirectMessage(this.ff, {
			id: this.id,
			...options
		});
}

export default DirectMessage;

import User from './user.js';

class DirectMessage {
	id: string;
	text: string;
	sender_id: string;
	recipient_id: string;
	created_at: string;
	sender_screen_name: string;
	recipient_screen_name: string;
	sender: User;
	recipient: User;
	in_reply_to?: DirectMessage;

	constructor(dm: DirectMessage) {
		this.id = dm.id;
		this.text = dm.text;
		this.sender_id = dm.sender_id;
		this.recipient_id = dm.recipient_id;
		this.created_at = dm.created_at;
		this.sender_screen_name = dm.sender_screen_name;
		this.recipient_screen_name = dm.recipient_screen_name;
		this.sender = new User(dm.sender);
		this.recipient = new User(dm.recipient);
		if (dm.in_reply_to) {
			this.in_reply_to = new DirectMessage(dm.in_reply_to);
		}
	}
}

export default DirectMessage;

'use strict';

class User {
	constructor(user) {
		this.id = user.id;
		this.name = user.name;
		this.screen_name = user.screen_name;
		this.unique_id = user.unique_id;
		this.location = user.location;
		this.gender = user.gender;
		this.birthday = user.birthday;
		this.description = user.description;
		this.profile_image_url = user.profile_image_url;
		this.profile_image_url_large = user.profile_image_url_large;
		this.url = user.url;
		this.protected = user.protected;
		this.followers_count = user.followers_count;
		this.friends_count = user.friends_count;
		this.favourites_count = user.favourites_count;
		this.statuses_count = user.statuses_count;
		this.photo_count = user.photo_count;
		this.following = user.following;
		this.notifications = user.notifications;
		this.created_at = user.created_at;
		this.utc_offset = user.utc_offset;
		this.profile_background_color = user.profile_background_color;
		this.profile_text_color = user.profile_text_color;
		this.profile_link_color = user.profile_link_color;
		this.profile_sidebar_fill_color = user.profile_sidebar_fill_color;
		this.profile_sidebar_border_color = user.profile_sidebar_border_color;
		this.profile_background_image_url = user.profile_background_image_url;
		this.profile_background_tile = user.profile_background_tile;
		if (user.status) {
			this.status = user.status;
		}

		this.profile_image_origin = this._getProfileImageOrigin();
		this.profile_image_origin_large = this._getProfileImageOriginLarge();
	}

	_getProfileImageOrigin() {
		return this.profile_image_url.replace(/\?\d{10}/, '');
	}

	_getProfileImageOriginLarge() {
		return this.profile_image_url_large.replace(/\?\d{10}/, '');
	}
}

module.exports = User;

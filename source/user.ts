import Fanfou from './index.js';
import * as api from './api.js';
import Status from './status.js';

type FollowOptions = {
	id?: string;
	mode?: api.Mode;
};

type UnfollowOptions = {
	id?: string;
	mode?: api.Mode;
	format?: api.Format;
	callback?: string;
};

type BlockOptions = {
	id?: string;
	mode?: api.Mode;
	format?: api.Format;
	callback?: string;
};

type UnblockOptions = {
	id?: string;
	mode?: api.Mode;
};

type CheckBlockOptions = {
	id?: string;
	mode?: api.Mode;
};

type AcceptFriendshipOptions = {
	id?: string;
	mode?: api.Mode;
	format?: api.Format;
	callback?: string;
};

type DenyFriendshipOptions = {
	id?: string;
	mode?: api.Mode;
	format?: api.Format;
	callback?: string;
};

class User {
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
	profileImageOrigin?: string;
	profileImageOriginLarge?: string;
	profileBackgroundColor?: string;
	profileTextColor?: string;
	profileLinkColor?: string;
	profileSidebarFillColor?: string;
	profileSidebarBorderColor?: string;
	profileBackgroundImageUrl?: string;
	profileBackgroundTile?: boolean;
	status?: Status;
	private readonly ff: Fanfou;

	constructor(ff: Fanfou, user: User) {
		this.ff = ff;
		this.id = user.id;
		this.name = user.name;
		this.screenName = user.screenName;
		this.uniqueId = user.uniqueId;
		this.location = user.location;
		this.gender = user.gender;
		this.birthday = user.birthday;
		this.description = user.description;
		this.profileImageUrl = user.profileImageUrl;
		this.profileImageUrlLarge = user.profileImageUrlLarge;
		this.url = user.url;
		this.protected = user.protected;
		this.followersCount = user.followersCount;
		this.friendsCount = user.friendsCount;
		this.favouritesCount = user.favouritesCount;
		this.statusesCount = user.statusesCount;
		this.photoCount = user.photoCount;
		this.following = user.following;
		this.notifications = user.notifications;
		this.createdAt = user.createdAt;
		this.utcOffset = user.utcOffset;
		this.profileBackgroundColor = user.profileBackgroundColor;
		this.profileTextColor = user.profileTextColor;
		this.profileLinkColor = user.profileLinkColor;
		this.profileSidebarFillColor = user.profileSidebarFillColor;
		this.profileSidebarBorderColor = user.profileSidebarBorderColor;
		this.profileBackgroundImageUrl = user.profileBackgroundImageUrl;
		this.profileBackgroundTile = user.profileBackgroundTile;
		this.profileImageOrigin = this.profileImageUrl.replace(/\?\d{10}/, '');
		this.profileImageOriginLarge = this.profileImageUrlLarge.replace(
			/\?\d{10}/,
			''
		);

		if (user.status) {
			this.status =
				user.status instanceof Status
					? user.status
					: new Status(ff, user.status);
		}
	}

	follow = async (options?: FollowOptions) =>
		api.createFriendship(this.ff, {
			id: this.id,
			...options
		});

	unfollow = async (options?: UnfollowOptions) =>
		api.dropFriendship(this.ff, {
			id: this.id,
			...options
		});

	block = async (options?: BlockOptions) =>
		api.createBlockedUser(this.ff, {
			id: this.id,
			...options
		});

	unblock = async (options?: UnblockOptions) =>
		api.dropBlockedUser(this.ff, {
			id: this.id,
			...options
		});

	checkBlock = async (options?: CheckBlockOptions) =>
		api.checkBlockExists(this.ff, {
			id: this.id,
			...options
		});

	tags = async (options?: api.GetUserTagsOptions) =>
		api.getUserTags(this.ff, {
			id: this.id,
			...options
		});

	show = async (options?: api.GetUserOptions) =>
		api.getUser(this.ff, {
			id: this.id,
			...options
		});

	timeline = async (options?: api.GetUserTimelineOptions) =>
		api.getUserTimeline(this.ff, {
			id: this.id,
			...options
		});

	searchTimeline = async (options: api.SearchUserTimelineOptions) =>
		api.searchUserTimeline(this.ff, {
			id: this.id,
			...options
		});

	recentFollowers = async (options?: api.GetRecentFollowersOptions) =>
		api.getRecentFollowers(this.ff, {
			id: this.id,
			...options
		});

	followers = async (options?: api.GetFollowersOptions) =>
		api.getFollowers(this.ff, {
			id: this.id,
			...options
		});

	followerIds = async (options?: api.GetFollowerIdsOptions) =>
		api.getFollowerIds(this.ff, {
			id: this.id,
			...options
		});

	followings = async (options?: api.GetFollowingsOptions) =>
		api.getFollowings(this.ff, {
			id: this.id,
			...options
		});

	followingIds = async (options?: api.GetFollowingIdsOptions) =>
		api.getFollowingIds(this.ff, {
			id: this.id,
			...options
		});

	acceptFriendship = async (options?: AcceptFriendshipOptions) =>
		api.acceptFriendship(this.ff, {
			id: this.id,
			...options
		});

	denyFriendship = async (options?: DenyFriendshipOptions) =>
		api.denyFriendship(this.ff, {
			id: this.id,
			...options
		});
}

export default User;

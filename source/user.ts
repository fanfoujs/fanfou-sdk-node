import Fanfou from './fanfou.js';
import * as api from './api.js';
import Status from './status.js';

export type UserFollowOptions = {
	id?: string;
	mode?: api.APIMode;
};

export type UserUnfollowOptions = {
	id?: string;
	mode?: api.APIMode;
	format?: api.APIFormat;
	callback?: string;
};

export type UserBlockOptions = {
	id?: string;
	mode?: api.APIMode;
	format?: api.APIFormat;
	callback?: string;
};

export type UserUnblockOptions = {
	id?: string;
	mode?: api.APIMode;
};

export type UserCheckBlockOptions = {
	id?: string;
	mode?: api.APIMode;
};

export type UserTagsOptions = api.GetUserTagsOptions;

export type UserShowOptions = api.GetUserOptions;

export type UserTimelineOptions = api.GetUserTimelineOptions;

export type UserSearchTimelineOptions = api.SearchUserTimelineOptions;

export type UserRecentFollowersOptions = api.GetRecentFollowersOptions;

export type UserFollowersOptions = api.GetFollowersOptions;

export type UserFollowerIdsOptions = api.GetFollowerIdsOptions;

export type UserFollowingsOptions = api.GetFollowingsOptions;

export type UserFollowingIdsOptions = api.GetFollowingIdsOptions;

export type UserAcceptFriendshipOptions = {
	id?: string;
	mode?: api.APIMode;
	format?: api.APIFormat;
	callback?: string;
};

export type UserDenyFriendshipOptions = {
	id?: string;
	mode?: api.APIMode;
	format?: api.APIFormat;
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

	constructor(ff: Fanfou, user: any) {
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

	follow = async (options?: UserFollowOptions) =>
		api.createFriendship(this.ff, {
			id: this.id,
			...options
		});

	unfollow = async (options?: UserUnfollowOptions) =>
		api.dropFriendship(this.ff, {
			id: this.id,
			...options
		});

	block = async (options?: UserBlockOptions) =>
		api.createBlockedUser(this.ff, {
			id: this.id,
			...options
		});

	unblock = async (options?: UserUnblockOptions) =>
		api.dropBlockedUser(this.ff, {
			id: this.id,
			...options
		});

	checkBlock = async (options?: UserCheckBlockOptions) =>
		api.checkBlockExists(this.ff, {
			id: this.id,
			...options
		});

	tags = async (options?: UserTagsOptions) =>
		api.getUserTags(this.ff, {
			id: this.id,
			...options
		});

	show = async (options?: UserShowOptions) =>
		api.getUser(this.ff, {
			id: this.id,
			...options
		});

	timeline = async (options?: UserTimelineOptions) =>
		api.getUserTimeline(this.ff, {
			id: this.id,
			...options
		});

	searchTimeline = async (options: UserSearchTimelineOptions) =>
		api.searchUserTimeline(this.ff, {
			id: this.id,
			...options
		});

	recentFollowers = async (options?: UserRecentFollowersOptions) =>
		api.getRecentFollowers(this.ff, {
			id: this.id,
			...options
		});

	followers = async (options?: UserFollowersOptions) =>
		api.getFollowers(this.ff, {
			id: this.id,
			...options
		});

	followerIds = async (options?: UserFollowerIdsOptions) =>
		api.getFollowerIds(this.ff, {
			id: this.id,
			...options
		});

	followings = async (options?: UserFollowingsOptions) =>
		api.getFollowings(this.ff, {
			id: this.id,
			...options
		});

	followingIds = async (options?: UserFollowingIdsOptions) =>
		api.getFollowingIds(this.ff, {
			id: this.id,
			...options
		});

	acceptFriendship = async (options?: UserAcceptFriendshipOptions) =>
		api.acceptFriendship(this.ff, {
			id: this.id,
			...options
		});

	denyFriendship = async (options?: UserDenyFriendshipOptions) =>
		api.denyFriendship(this.ff, {
			id: this.id,
			...options
		});
}

export default User;

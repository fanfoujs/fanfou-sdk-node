/* eslint @typescript-eslint/no-unsafe-return: off */
import Fanfou from './fanfou.js';
import {Status, User, Trend, DirectMessage} from './types.js';

export type APIMode = 'default' | 'lite';
export type APIFormat = 'html';

export type SearchPublicTimelineOptions = {
	q: string;
	sinceId?: string;
	maxId?: string;
	count?: number;
	mode?: APIMode;
	format?: APIFormat;
	callback?: string;
};

export const searchPublicTimeline = async (
	ff: Fanfou,
	options: SearchPublicTimelineOptions,
): Promise<Status[]> => ff.get('/search/public_timeline', options);

export type SearchUsersOptions = {
	q: string;
	count?: number;
	page?: string;
	mode?: APIMode;
	format?: APIFormat;
	callback?: string;
};

export type SearchUsersResult = {
	totalNumber: number;
	users: User[];
};

export const searchUsers = async (
	ff: Fanfou,
	options: SearchUsersOptions,
): Promise<SearchUsersResult> => ff.get('/search/users', options);

export type SearchUserTimelineOptions = {
	q: string;
	id?: string;
	sinceId?: string;
	maxId?: string;
	count?: number;
	mode?: APIMode;
	format?: APIFormat;
	callback?: string;
};

export const searchUserTimeline = async (
	ff: Fanfou,
	options: SearchUserTimelineOptions,
): Promise<Status[]> => ff.get('/search/user_timeline', options);

export const getBlockedIds = async (ff: Fanfou): Promise<string[]> =>
	ff.get('/blocks/ids');

export type GetBlockedUsersOptions = {
	mode?: APIMode;
	page?: number;
	count?: number;
};

export const getBlockedUsers = async (
	ff: Fanfou,
	options?: GetBlockedUsersOptions,
): Promise<User[]> => ff.get('/blocks/blocking', options);

export type CreateBlockedUserOptions = {
	id: string;
	mode?: APIMode;
	format?: APIFormat;
	callback?: string;
};

export const createBlockedUser = async (
	ff: Fanfou,
	options: CreateBlockedUserOptions,
): Promise<User> => ff.post('/blocks/create', options);

export type CheckBlockExistsOptions = {
	id: string;
	mode?: APIMode;
};

export const checkBlockExists = async (
	ff: Fanfou,
	options: CheckBlockExistsOptions,
): Promise<User> => ff.get('/blocks/exists', options);

export type DropBlockedUserOptions = {
	id: string;
	mode?: APIMode;
};

export const dropBlockedUser = async (
	ff: Fanfou,
	options: DropBlockedUserOptions,
): Promise<User> => ff.post('/blocks/destroy', options);

export type GetTaggedUsersOptions = {
	tag?: string;
	count?: number;
	page?: number;
	mode?: APIMode;
	format?: APIFormat;
	callback?: string;
};

export const getTaggedUsers = async (
	ff: Fanfou,
	options?: GetTaggedUsersOptions,
): Promise<User[]> => ff.post('/users/tagged', options);

export type GetUserOptions = {
	id?: string;
	mode?: APIMode;
	format?: APIFormat;
	callback?: string;
};

export const getUser = async (
	ff: Fanfou,
	options?: GetUserOptions,
): Promise<User> => ff.get('/users/show', options);

export type GetUserTagsOptions = {
	id?: string;
	callback?: string;
};

export const getUserTags = async (
	ff: Fanfou,
	options?: GetUserTagsOptions,
): Promise<string[]> => ff.get('/users/tag_list', options);

export type GetRecentFollowersOptions = {
	id?: string;
	count?: number;
	page?: number;
	mode?: APIMode;
	format?: APIFormat;
	callback?: string;
};

export const getRecentFollowers = async (
	ff: Fanfou,
	options?: GetRecentFollowersOptions,
): Promise<User[]> => ff.get('/users/followers', options);

export type GetRecommendedUsersOptions = {
	count?: number;
	page?: number;
	mode?: APIMode;
	format?: APIFormat;
	callback?: string;
};

export const getRecommendedUsers = async (
	ff: Fanfou,
	options?: GetRecommendedUsersOptions,
): Promise<User[]> => ff.get('/users/recommendation', options);

export type DismissRecommendedUserOptions = {
	id: string;
	mode?: APIMode;
	format?: APIFormat;
	callback?: string;
};

export const dismissRecommendedUser = async (
	ff: Fanfou,
	options: DismissRecommendedUserOptions,
): Promise<User> => ff.post('/users/cancel_recommendation', options);

export type GetRecentUsersOptions = {
	id?: string;
	count?: number;
	page?: number;
	mode?: APIMode;
	format?: APIFormat;
	callback?: string;
};

export const getRecentUsers = async (
	ff: Fanfou,
	options?: GetRecentUsersOptions,
): Promise<User[]> => ff.get('/users/friends', options);

export type VerifyCredentialsOptions = {
	mode?: APIMode;
	format?: APIFormat;
	callback?: string;
};

export const verifyCredentials = async (
	ff: Fanfou,
	options?: VerifyCredentialsOptions,
): Promise<User> => ff.get('/account/verify_credentials', options);

export type UpdateProfileImageOptions = {
	image: ReadableStream;
	mode?: APIMode;
	format?: APIFormat;
	callback?: string;
};

export const updateProfileImage = async (
	ff: Fanfou,
	options: UpdateProfileImageOptions,
): Promise<User> => ff.post('/account/update_profile_image', options);

export type GetRateLimitStatusOptions = {
	callback?: string;
};

export type GetRateLimitStatusResult = {
	resetTime: string;
	remainingHit: number;
	hourlyLimit: number;
	resetTimeInSeconds: number;
};

export const getRateLimitStatus = async (
	ff: Fanfou,
	options?: GetRateLimitStatusOptions,
): Promise<GetRateLimitStatusResult> =>
	ff.get('/account/rate_limit_status', options);

export type UpdateProfileOptions = {
	url?: string;
	mode?: APIMode;
	callback?: string;
	location?: string;
	description?: string;
	name?: string;
	email?: string;
};

export const updateProfile = async (
	ff: Fanfou,
	options?: UpdateProfileOptions,
): Promise<User> => ff.post('/account/update_profile', options);

export type GetNotificationResult = {
	mentions: number;
	directMessages: number;
	friendRequest: number;
};

export const getNotification = async (
	ff: Fanfou,
): Promise<GetNotificationResult> => ff.get('/account/notification');

export type UpdateNotifyNumberOptions = {
	notifyNum: number;
};

export type UpdateNotifyNumberResult = {
	result: string;
	notifyNum: number;
};

export const updateNotifyNumber = async (
	ff: Fanfou,
	options?: UpdateNotifyNumberOptions,
): Promise<UpdateNotifyNumberResult> =>
	ff.post('/account/update_notify_num', options);

export type CreateSavedSearchOptions = {
	query?: string;
	callback?: string;
};

export const createSavedSearch = async (
	ff: Fanfou,
	options?: CreateSavedSearchOptions,
): Promise<Trend> => ff.post('/saved_searches/create', options);

export type DropSavedSearchOptions = {
	id: number;
	callback?: string;
};

export const dropSavedSearch = async (
	ff: Fanfou,
	options: DropSavedSearchOptions,
): Promise<Trend> => ff.post('/saved_searches/destroy', options);

export type GetSavedSearchOptions = {
	id?: number;
	callback?: string;
};

export const getSavedSearch = async (
	ff: Fanfou,
	options?: GetSavedSearchOptions,
): Promise<Trend> => ff.get('/saved_searches/show', options);

export type GetSavedSearchesOptions = {
	callback?: string;
};

export const getSavedSearches = async (
	ff: Fanfou,
	options?: GetSavedSearchesOptions,
): Promise<Trend[]> => ff.get('/saved_searches/list', options);

export type GetUserPhotosOptions = {
	id?: string;
	sinceId?: string;
	maxId?: string;
	count?: number;
	page?: number;
	mode?: APIMode;
	format?: APIFormat;
	callback?: string;
};

export const getUserPhotos = async (
	ff: Fanfou,
	options?: GetUserPhotosOptions,
): Promise<Status> => ff.get('/photos/user_timeline', options);

export type UploadPhotoOptions = {
	photo: ReadableStream;
	status?: string;
	source?: string;
	location?: string;
	mode?: APIMode;
	format?: APIFormat;
	callback?: string;
};

export const uploadPhoto = async (
	ff: Fanfou,
	options: UploadPhotoOptions,
): Promise<Status> => ff.post('/photos/upload', options);

export type GetTrendsOptions = {
	callback?: string;
};

export type GetTrendsResult = {
	asOf: string;
	trends: Trend[];
};

export const getTrends = async (
	ff: Fanfou,
	options?: GetTrendsOptions,
): Promise<GetTrendsResult> => ff.get('/trends/list', options);

export type GetFollowerIdsOptions = {
	id?: string;
	page?: number;
	count?: number;
	callback?: string;
};

export const getFollowerIds = async (
	ff: Fanfou,
	options?: GetFollowerIdsOptions,
): Promise<string[]> => ff.get('/follower/ids', options);

export type DropFavoriteOptions = {
	id: string;
	mode?: APIMode;
	format?: APIFormat;
};

export const dropFavorite = async (
	ff: Fanfou,
	options: DropFavoriteOptions,
): Promise<Status> => {
	const {id, ...restOptions} = options;
	return ff.post(`/favorites/destroy/${id}`, restOptions);
};

export type GetFavoritesOptions = {
	id?: string;
	count?: number;
	page?: number;
	mode?: APIMode;
	format?: APIFormat;
	callback?: string;
};

export const getFavorites = async (
	ff: Fanfou,
	options: GetFavoritesOptions = {},
): Promise<Status[]> => {
	const {id = '', ...restOptions} = options;
	return ff.get(`/favorites/${id}`, restOptions);
};

export type CreateFavoriteOptions = {
	id: string;
	mode?: APIMode;
	format?: APIFormat;
	callback?: string;
};

export const createFavorite = async (
	ff: Fanfou,
	options: CreateFavoriteOptions,
): Promise<Status> => {
	const {id, ...restOptions} = options;
	return ff.post(`/favorites/create/${id}`, restOptions);
};

export type CreateFriendshipOptions = {
	id: string;
	mode?: APIMode;
};

export const createFriendship = async (
	ff: Fanfou,
	options: CreateFriendshipOptions,
): Promise<User> => ff.post('/friendships/create', options);

export type DropFriendshipOptions = {
	id: string;
	mode?: APIMode;
	format?: APIFormat;
	callback?: string;
};

export const dropFriendship = async (
	ff: Fanfou,
	options: DropFriendshipOptions,
): Promise<User> => ff.post('/friendships/destroy', options);

export type CheckFriendshipRequestsOptions = {
	page?: number;
	count?: number;
	mode?: APIMode;
	format?: APIFormat;
	callback?: string;
};

export const checkFriendshipRequests = async (
	ff: Fanfou,
	options: CheckFriendshipRequestsOptions,
): Promise<User[]> => ff.get('/friendships/requests', options);

export type DenyFriendshipOptions = {
	id: string;
	mode?: APIMode;
	format?: APIFormat;
	callback?: string;
};

export const denyFriendship = async (
	ff: Fanfou,
	options: DenyFriendshipOptions,
): Promise<User> => ff.post('/friendships/deny', options);

export type CheckFriendshipOptions = {
	userA: string;
	userB: string;
};

export const checkFriendship = async (
	ff: Fanfou,
	options: CheckFriendshipOptions,
): Promise<boolean> => {
	const result = await ff.get('/friendships/exists', options);
	return result === 'true';
};

export type AcceptFriendshipOptions = {
	id: string;
	mode?: APIMode;
	format?: APIFormat;
	callback?: string;
};

export const acceptFriendship = async (
	ff: Fanfou,
	options: AcceptFriendshipOptions,
): Promise<User> => ff.post('/friendships/accept', options);

export type CheckFriendshipDetailOptions = {
	sourceLoginName?: string;
	targetLoginName?: string;
	source_id?: string;
	target_id?: string;
};

export type FriendshipResult = {
	id: string;
	screenName: string;
	following: boolean;
	followedBy: boolean;
	notificationEnabled?: boolean;
	blocking?: boolean;
};

export type CheckFriendshipDetailResult = {
	relationship: {
		source: FriendshipResult;
		target: FriendshipResult;
	};
};

const parseRelationship = (friendship: FriendshipResult): FriendshipResult => {
	friendship.following &&= String(friendship.following) === 'true';
	friendship.followedBy &&= String(friendship.followedBy) === 'true';
	friendship.notificationEnabled &&=
		String(friendship.notificationEnabled) === 'true';
	friendship.blocking &&= String(friendship.blocking) === 'true';
	return friendship;
};

export const checkFriendshipDetail = async (
	ff: Fanfou,
	options: CheckFriendshipDetailOptions,
): Promise<CheckFriendshipDetailResult> => {
	const result = await ff.get('/friendships/show', options);
	const {source, target} = result.relationship;
	const parsedResult = {
		relationship: {
			source: parseRelationship(source),
			target: parseRelationship(target),
		},
	};
	return parsedResult;
};

export type GetFollowingIdsOptions = {
	id?: string;
	page?: number;
	count?: number;
	callback?: string;
};

export const getFollowingIds = async (
	ff: Fanfou,
	options?: GetFollowingIdsOptions,
): Promise<string[]> => ff.get('/friends/ids', options);

export type DropStatusOptions = {
	id: string;
	mode?: APIMode;
	format?: APIFormat;
	callback?: string;
};

export const dropStatus = async (
	ff: Fanfou,
	options: DropStatusOptions,
): Promise<User> => ff.post('/statuses/destroy', options);

export type GetHomeTimelineOptions = {
	id?: string;
	sinceId?: string;
	maxId?: string;
	count?: number;
	page?: number;
	mode?: APIMode;
	format?: APIFormat;
	callback?: string;
};

export const getHomeTimeline = async (
	ff: Fanfou,
	options?: GetHomeTimelineOptions,
): Promise<Status[]> => ff.get('/statuses/home_timeline', options);

export type GetPublicTimelineOptions = {
	count?: number;
	sinceId?: string;
	maxId?: string;
	mode?: APIMode;
	format?: APIFormat;
	callback?: string;
};

export const getPublicTimeline = async (
	ff: Fanfou,
	options?: GetPublicTimelineOptions,
): Promise<Status[]> => ff.get('/statuses/public_timeline', options);

export type GetRepliesOptions = {
	sinceId?: string;
	maxId?: string;
	count?: number;
	page?: number;
	mode?: APIMode;
	format?: APIFormat;
	callback?: string;
};

export const getReplies = async (
	ff: Fanfou,
	options?: GetRepliesOptions,
): Promise<Status[]> => ff.get('/statuses/replies', options);

export type GetFollowersOptions = {
	id?: string;
	count?: number;
	page?: number;
	mode?: APIMode;
	format?: APIFormat;
	callback?: string;
};

export const getFollowers = async (
	ff: Fanfou,
	options?: GetFollowersOptions,
): Promise<User[]> => ff.get('/statuses/followers', options);

export type CreateStatusOptions = {
	status: string;
	inReplyToStatusId?: string;
	inReplyToUserId?: string;
	repostStatusId?: string;
	source?: string;
	mode?: APIMode;
	location?: string;
	callback?: string;
};

export const createStatus = async (
	ff: Fanfou,
	options: CreateStatusOptions,
): Promise<Status> => ff.post('/statuses/update', options);

export type GetUserTimelineOptions = {
	id?: string;
	sinceId?: string;
	maxId?: string;
	count?: string;
	page?: string;
	mode?: APIMode;
	format?: APIFormat;
	callback?: string;
};

export const getUserTimeline = async (
	ff: Fanfou,
	options?: GetUserTimelineOptions,
): Promise<Status[]> => ff.get('/statuses/user_timeline', options);

export type GetFollowingsOptions = {
	id?: string;
	count?: number;
	page?: number;
	mode?: APIMode;
	callback?: string;
};

export const getFollowings = async (
	ff: Fanfou,
	options?: GetFollowingsOptions,
): Promise<User[]> => ff.get('/statuses/friends', options);

export type GetContextTimelineOptions = {
	id: string;
	mode?: APIMode;
	format?: APIFormat;
	callback?: string;
};

export const getContextTimeline = async (
	ff: Fanfou,
	options: GetContextTimelineOptions,
): Promise<Status[]> => ff.get('/statuses/context_timeline', options);

export type GetMentionsOptions = {
	sinceId?: string;
	maxId?: string;
	count?: number;
	page?: number;
	mode?: APIMode;
	format?: APIFormat;
};

export const getMentions = async (
	ff: Fanfou,
	options: GetMentionsOptions,
): Promise<Status[]> => ff.get('/statuses/mentions', options);

export type GetStatusOptions = {
	id: string;
	mode?: APIMode;
	format?: APIFormat;
	callback?: string;
};

export const getStatus = async (
	ff: Fanfou,
	options: GetStatusOptions,
): Promise<Status> => ff.get('/statuses/show', options);

export type DropDirectMessageOptions = {
	id: string;
	callback?: string;
};

export const dropDirectMessage = async (
	ff: Fanfou,
	options: DropDirectMessageOptions,
): Promise<DirectMessage> => ff.post('/direct_messages/destroy', options);

export type GetConversationOptions = {
	id: string;
	count?: number;
	page?: number;
	maxId?: string;
	sinceId?: string;
	mode?: APIMode;
	callback?: string;
};

export const getConversation = async (
	ff: Fanfou,
	options: GetConversationOptions,
): Promise<DirectMessage[]> => ff.get('/direct_messages/conversation', options);

export type CreateDirectMessageOptions = {
	user: string;
	text: string;
	inReplyToId?: string;
	mode?: APIMode;
	callback?: string;
};

export const createDirectMessage = async (
	ff: Fanfou,
	options: CreateDirectMessageOptions,
): Promise<DirectMessage> => ff.post('/direct_messages/new', options);

export type GetConversationsOptions = {
	count?: number;
	page?: number;
	mode?: string;
	callback?: string;
};

export type GetConversationsResult = {
	dm: DirectMessage;
	otherid: string;
	msgNum: number;
	newConv: boolean;
};

export const getConversations = async (
	ff: Fanfou,
	options?: GetConversationsOptions,
): Promise<GetConversationsOptions> =>
	ff.get('/direct_messages/conversation_list', options);

export type GetInboxOptions = {
	count?: number;
	page?: number;
	sinceId?: string;
	maxId?: string;
	mode?: string;
	callback?: string;
};

export const getInbox = async (
	ff: Fanfou,
	options?: GetInboxOptions,
): Promise<DirectMessage[]> => ff.get('/direct_messages/inbox', options);

export type GetSentOptions = {
	count?: number;
	page?: number;
	sinceId?: string;
	maxId?: string;
	mode?: APIMode;
	callback?: string;
};

export const getSent = async (
	ff: Fanfou,
	options?: GetSentOptions,
): Promise<DirectMessage[]> => ff.get('/direct_messages/sent', options);

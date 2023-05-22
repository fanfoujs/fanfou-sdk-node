/* eslint @typescript-eslint/no-unsafe-call: off, @typescript-eslint/no-unsafe-return: off */
import got from 'got';
import hmacsha1 from 'hmacsha1';
import OAuth from 'oauth-1.0a';
import queryString from 'query-string';
import camelcaseKeys from 'camelcase-keys';
import decamelizedKeys from 'decamelize-keys';
import FormData from 'form-data';
import * as api from './api.js';
import FanfouError from './ff-error.js';

export type FanfouToken = {
	oauthToken: string;
	oauthTokenSecret: string;
};

export type FanfouHooks = {
	baseString?: (s: string) => string;
};

export type FanfouOptions = {
	consumerKey?: string;
	consumerSecret?: string;
	oauthToken?: string;
	oauthTokenSecret?: string;
	username?: string;
	password?: string;
	protocol?: string;
	apiDomain?: string;
	oauthDomain?: string;
	hooks?: FanfouHooks;
};

class Fanfou {
	consumerKey: string;
	consumerSecret: string;
	oauthToken: string;
	oauthTokenSecret: string;
	username: string;
	password: string;
	protocol: string;
	apiDomain: string;
	oauthDomain: string;
	hooks: FanfouHooks;
	private readonly apiEndPoint: string;
	private readonly oauthEndPoint: string;
	private readonly o: OAuth;

	constructor(options: FanfouOptions = {}) {
		this.consumerKey = options.consumerKey ?? '';
		this.consumerSecret = options.consumerSecret ?? '';
		this.oauthToken = options.oauthToken ?? '';
		this.oauthTokenSecret = options.oauthTokenSecret ?? '';
		this.username = options.username ?? '';
		this.password = options.password ?? '';
		this.protocol = options.protocol ?? 'http:';
		this.apiDomain = options.apiDomain ?? 'api.fanfou.com';
		this.oauthDomain = options.oauthDomain ?? 'fanfou.com';
		this.hooks = options.hooks ?? {};
		this.apiEndPoint = `${this.protocol}//${this.apiDomain}`;
		this.oauthEndPoint = `${this.protocol}//${this.oauthDomain}`;
		this.o = new OAuth({
			consumer: {key: this.consumerKey, secret: this.consumerSecret},
			signature_method: 'HMAC-SHA1',
			parameter_seperator: ',',
			/* c8 ignore start  */
			hash_function: (baseString, key) => {
				const {baseString: baseStringHook} = this.hooks;
				if (baseStringHook) {
					baseString = baseStringHook(baseString);
				}

				return hmacsha1(key, baseString);
			},
			/* c8 ignore stop  */
		});
	}

	async getRequestToken() {
		const url = `${this.oauthEndPoint}/oauth/request_token`;
		const {Authorization} = this.o.toHeader(
			this.o.authorize({url, method: 'GET'}),
		);
		try {
			const response = await got.get(url, {
				headers: {Authorization},
			});
			const {body} = response;
			const result = queryString.parse(body);
			this.oauthToken = result['oauth_token'] as string;
			this.oauthTokenSecret = result['oauth_token_secret'] as string;
			return this;
			/* c8 ignore start */
		} catch (error) {
			throw new FanfouError(error);
		}
		/* c8 ignore stop */
	}

	async getAccessToken(token: FanfouToken) {
		const url = `${this.oauthEndPoint}/oauth/access_token`;
		const {Authorization} = this.o.toHeader(
			this.o.authorize(
				{url, method: 'GET'},
				{key: token.oauthToken, secret: token.oauthTokenSecret},
			),
		);
		try {
			const response = await got.get(url, {
				headers: {Authorization},
			});
			const {body} = response;
			const result = queryString.parse(body);
			this.oauthToken = result['oauth_token'] as string;
			this.oauthTokenSecret = result['oauth_token_secret'] as string;
			return this;
			/* c8 ignore start */
		} catch (error) {
			throw new FanfouError(error);
		}
		/* c8 ignore stop */
	}

	async xauth() {
		const url = `${this.oauthEndPoint}/oauth/access_token`;
		const parameters = {
			x_auth_mode: 'client_auth',
			x_auth_password: this.password,
			x_auth_username: this.username,
		};
		const {Authorization} = this.o.toHeader(
			this.o.authorize({url, method: 'POST'}),
		);
		try {
			const response = await got.post(url, {
				headers: {
					Authorization,
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: queryString.stringify(parameters),
			});
			const {body} = response;
			const result = queryString.parse(body);
			this.oauthToken = result['oauth_token'] as string;
			this.oauthTokenSecret = result['oauth_token_secret'] as string;
			return this;
			/* c8 ignore start */
		} catch (error) {
			throw new FanfouError(error);
		}
		/* c8 ignore stop */
	}

	async get(uri: string, parameters: Record<string, any> = {}) {
		parameters = decamelizedKeys(parameters, '_');
		const query = queryString.stringify(parameters);
		const url = `${this.apiEndPoint}${uri}.json${query ? `?${query}` : ''}`;
		const token = {key: this.oauthToken, secret: this.oauthTokenSecret};
		const {Authorization} = this.o.toHeader(
			this.o.authorize({url, method: 'GET'}, token),
		);
		try {
			const {body} = await got.get(url, {
				headers: {
					Authorization,
					'Content-Type': 'application/x-www-form-urlencoded',
				},
			});
			return camelcaseKeys(JSON.parse(body), {deep: true});
			/* c8 ignore start */
		} catch (error) {
			throw new FanfouError(error);
		}
		/* c8 ignore stop */
	}

	async post(uri: string, parameters: Record<string, any> = {}) {
		parameters = decamelizedKeys(parameters, '_');
		const url = `${this.apiEndPoint}${uri}.json`;
		const token = {key: this.oauthToken, secret: this.oauthTokenSecret};
		const isUpload = [
			'/photos/upload',
			'/account/update_profile_image',
		].includes(uri);
		const {Authorization} = this.o.toHeader(
			this.o.authorize(
				{url, method: 'POST', data: isUpload ? null : parameters},
				token,
			),
		);
		let form: FormData;
		const headers = {
			Authorization,
			'Content-Type': 'application/x-www-form-urlencoded',
		};
		if (isUpload) {
			form = new FormData();
			for (const key of Object.keys(parameters)) {
				form.append(key, parameters[key]);
			}

			// @ts-expect-error: Drop `Content-Type`
			delete headers['Content-Type'];
		}

		try {
			const {body} = await got.post(url, {
				headers,
				// @ts-expect-error: Can be `undefined`
				body: isUpload ? form : queryString.stringify(parameters),
			});
			return camelcaseKeys(JSON.parse(body), {deep: true});
			/* c8 ignore start */
		} catch (error) {
			throw new FanfouError(error);
		}
		/* c8 ignore stop */
	}

	/* c8 ignore start */
	acceptFriendship = async (options: api.AcceptFriendshipOptions) =>
		api.acceptFriendship(this, options);

	checkBlockExists = async (options: api.CheckBlockExistsOptions) =>
		api.checkBlockExists(this, options);

	checkFriendship = async (options: api.CheckFriendshipOptions) =>
		api.checkFriendship(this, options);

	checkFriendshipDetail = async (options: api.CheckFriendshipDetailOptions) =>
		api.checkFriendshipDetail(this, options);

	checkFriendshipRequests = async (
		options: api.CheckFriendshipRequestsOptions,
	) => api.checkFriendshipRequests(this, options);

	createBlockedUser = async (options: api.CreateBlockedUserOptions) =>
		api.createBlockedUser(this, options);

	createDirectMessage = async (options: api.CreateDirectMessageOptions) =>
		api.createDirectMessage(this, options);

	createFavorite = async (options: api.CreateFavoriteOptions) =>
		api.createFavorite(this, options);

	createFriendship = async (options: api.CreateFriendshipOptions) =>
		api.createFriendship(this, options);

	createSavedSearch = async (options: api.CreateSavedSearchOptions) =>
		api.createSavedSearch(this, options);

	createStatus = async (options: api.CreateStatusOptions) =>
		api.createStatus(this, options);

	denyFriendship = async (options: api.DenyFriendshipOptions) =>
		api.denyFriendship(this, options);

	dismissRecommendedUser = async (options: api.DismissRecommendedUserOptions) =>
		api.dismissRecommendedUser(this, options);

	dropBlockedUser = async (options: api.DropBlockedUserOptions) =>
		api.dropBlockedUser(this, options);

	dropDirectMessage = async (options: api.DropDirectMessageOptions) =>
		api.dropDirectMessage(this, options);

	dropFavorite = async (options: api.DropFavoriteOptions) =>
		api.dropFavorite(this, options);

	dropFriendship = async (options: api.DropFriendshipOptions) =>
		api.dropFriendship(this, options);

	dropSavedSearch = async (options: api.DropSavedSearchOptions) =>
		api.dropSavedSearch(this, options);

	dropStatus = async (options: api.DropStatusOptions) =>
		api.dropStatus(this, options);

	getBlockedIds = async () => api.getBlockedIds(this);

	getBlockedUsers = async (options?: api.GetBlockedUsersOptions) =>
		api.getBlockedUsers(this, options);

	getContextTimeline = async (options: api.GetContextTimelineOptions) =>
		api.getContextTimeline(this, options);

	getConversation = async (options: api.GetConversationOptions) =>
		api.getConversation(this, options);

	getConversations = async (options?: api.GetConversationsOptions) =>
		api.getConversations(this, options);

	getFavorites = async (options?: api.GetFavoritesOptions) =>
		api.getFavorites(this, options);

	getFollowerIds = async (options?: api.GetFollowerIdsOptions) =>
		api.getFollowerIds(this, options);

	getFollowers = async (options?: api.GetFollowersOptions) =>
		api.getFollowers(this, options);

	getFollowingIds = async (options?: api.GetFollowingIdsOptions) =>
		api.getFollowingIds(this, options);

	getFollowings = async (options?: api.GetFollowingsOptions) =>
		api.getFollowings(this, options);

	getHomeTimeline = async (options?: api.GetHomeTimelineOptions) =>
		api.getHomeTimeline(this, options);

	getInbox = async (options?: api.GetInboxOptions) =>
		api.getInbox(this, options);

	getMentions = async (options: api.GetMentionsOptions) =>
		api.getMentions(this, options);

	getNotification = async () => api.getNotification(this);

	getPublicTimeline = async (options: api.GetPublicTimelineOptions) =>
		api.getPublicTimeline(this, options);

	getRateLimitStatus = async (options: api.GetRateLimitStatusOptions) =>
		api.getRateLimitStatus(this, options);

	getRecentFollowers = async (options: api.GetRecentFollowersOptions) =>
		api.getRecentFollowers(this, options);

	getRecentUsers = async (options: api.GetRecentUsersOptions) =>
		api.getRecentUsers(this, options);

	getRecommendedUsers = async (options: api.GetRecommendedUsersOptions) =>
		api.getRecommendedUsers(this, options);

	getReplies = async (options: api.GetRepliesOptions) =>
		api.getReplies(this, options);

	getSavedSearch = async (options: api.GetSavedSearchOptions) =>
		api.getSavedSearch(this, options);

	getSavedSearches = async (options: api.GetSavedSearchesOptions) =>
		api.getSavedSearches(this, options);

	getSent = async (options: api.GetSentOptions) => api.getSent(this, options);

	getStatus = async (options: api.GetStatusOptions) =>
		api.getStatus(this, options);

	getTaggedUsers = async (options: api.GetTaggedUsersOptions) =>
		api.getTaggedUsers(this, options);

	getTrends = async (options: api.GetTrendsOptions) =>
		api.getTrends(this, options);

	getUser = async (options: api.GetUserOptions) => api.getUser(this, options);

	getUserPhotos = async (options: api.GetUserPhotosOptions) =>
		api.getUserPhotos(this, options);

	getUserTags = async (options: api.GetUserTagsOptions) =>
		api.getUserTags(this, options);

	getUserTimeline = async (options: api.GetUserTimelineOptions) =>
		api.getUserTimeline(this, options);

	searchPublicTimeline = async (options: api.SearchPublicTimelineOptions) =>
		api.searchPublicTimeline(this, options);

	searchUserTimeline = async (options: api.SearchUserTimelineOptions) =>
		api.searchUserTimeline(this, options);

	searchUsers = async (options: api.SearchUsersOptions) =>
		api.searchUsers(this, options);

	updateNotifyNumber = async (options: api.UpdateNotifyNumberOptions) =>
		api.updateNotifyNumber(this, options);

	updateProfile = async (options: api.UpdateProfileOptions) =>
		api.updateProfile(this, options);

	updateProfileImage = async (options: api.UpdateProfileImageOptions) =>
		api.updateProfileImage(this, options);

	uploadPhoto = async (options: api.UploadPhotoOptions) =>
		api.uploadPhoto(this, options);

	verifyCredentials = async (options: api.VerifyCredentialsOptions) =>
		api.verifyCredentials(this, options);
	/* c8 ignore stop */
}

export default Fanfou;

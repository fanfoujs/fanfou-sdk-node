import Fanfou from './fanfou.js';
import * as api from './api.js';

export type TrendFavorite = api.CreateSavedSearchOptions;

export type TrendUnfavoriteOptions = {
	id?: number;
	callback?: string;
};

export type TrendShowOptions = {
	id?: number;
	callback?: string;
};

class Trend {
	id: number;
	query: string;
	name: string;
	createdAt: string;
	private readonly ff: Fanfou;

	constructor(ff: Fanfou, trend: any) {
		this.ff = ff;
		this.id = trend.id;
		this.query = trend.query;
		this.name = trend.query;
		this.createdAt = trend.createdAt;
	}

	favorite = async (options?: TrendFavorite) =>
		api.createSavedSearch(this.ff, {
			query: this.query,
			...options
		});

	unfavorite = async (options?: TrendUnfavoriteOptions) =>
		api.dropSavedSearch(this.ff, {
			id: this.id,
			...options
		});

	show = async (options?: TrendShowOptions) =>
		api.getSavedSearch(this.ff, {
			id: this.id,
			...options
		});
}

export default Trend;

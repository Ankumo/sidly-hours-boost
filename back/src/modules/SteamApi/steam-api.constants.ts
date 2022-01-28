import { SteamApiMethods } from './steam-api.types';

export const ENDPOINT = 'https://api.steampowered.com/';
export const METHODS: Record<keyof SteamApiMethods, string> = {
    user_summaries: 'ISteamUser/GetPlayerSummaries/v2/',
    owned_apps: 'IPlayerService/GetOwnedGames/v1/',
    app_list: 'IStoreService/GetAppList/v1/',
};

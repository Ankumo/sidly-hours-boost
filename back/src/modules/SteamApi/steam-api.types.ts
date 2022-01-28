export type SteamApiMethodMetadata<T = any, U = any> = {
    data: T;
    returns: U;
};

export type SteamApiMethods = {
    user_summaries: SteamApiMethodMetadata<
        string[],
        {
            response: {
                players: {
                    steamid: string;
                    personaname: string;
                    avatar: string;
                    avatarfull: string;
                    avatarmedium: string;
                }[];
            };
        }
    >;
    owned_apps: SteamApiMethodMetadata<
        {
            steamid: string;
            include_appinfo: boolean;
            include_player_free_games?: boolean;
        },
        {
            response: {
                game_count?: number;
                games?: {
                    appid: number;
                    name: string;
                    img_logo_url: string;
                    img_icon_url: string;
                    has_community_visible_stats: string;
                    playtime_forever: number;
                }[];
            };
        }
    >;
    app_list: SteamApiMethodMetadata<
        {
            if_modified_since?: number;
            include_games?: boolean;
            include_software?: boolean;
            include_dlc?: boolean;
            last_appid?: number;
            max_results?: number;
        },
        {
            response: {
                apps: {
                    appid: number;
                    name: string;
                    last_modified: number;
                    price_change_number: number;
                }[];
                have_more_results: boolean;
                last_appid: number;
            };
        }
    >;
};

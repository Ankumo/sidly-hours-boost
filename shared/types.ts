export type StringMap<V = any> = Record<string, V>;
export type PromiseType<T> = T extends PromiseLike<infer U> ? U : T;

export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends Array<infer U>
        ? Array<DeepPartial<U>>
        : T[P] extends ReadonlyArray<infer U>
        ? ReadonlyArray<DeepPartial<U>>
        : DeepPartial<T[P]> | T[P];
};

export enum ApiErr {
    Unexpected,
    UserAlreadyExists,
    UserNotFound,
    OldPasswordIncorrect,
    BotLogonError,
    AccountNotFound,
    NoAppIds,
    BotBlocked,
    SteamApiError,
    AccountIsPrivate,
    NoOnlineBots,
    BotNoSteamId,
    UsernameNotFound,
    AccountNotYours,
    AccountAlreadyExists,
    AppAlreadyExists,
    BotNeedRelogon,
    CannotDeleteRootUser,
    InvalidPassword,
    TooMuchAccounts,
    TooMuchApps,
    TooMuchYourActiveAccounts,
    TooMuchActiveAccounts,
}

export const titleTypes = ["default", "rich", "none"] as const;

export type SteamBotCustomTitle = {
    type: typeof titleTypes[number];
    title: string;
    placeholders: StringMap<string>;
    mainApp: number;
};

export type SteamImageData = {
    image_small: string;
    image_large: string;
    movie_webm: string;
    movie_mp4: string;
};

export type SteamBotPersonaInfo = {
    frame: SteamImageData;
    bg: SteamImageData;
    name: string;
    miniBg: SteamImageData;
    avatar: string;
};

export type EventTypes<Account, User, SteamApp> = {
    user_deleted: {
        username: string;
    };
    account_deleted: {
        id: number;
    };
    account_state: DeepPartial<Account>;
    shared: Account;
    unshared: {
        id: number;
    };
    init: {
        user: User;
        accounts: Account[];
        apps: DeepPartial<SteamApp>[];
    };
    account_add: DeepPartial<Account>;
    account_unshared: {
        id: number;
        userId: number;
    };
    account_shared: {
        id: number;
        user: User;
    };
    update_cache: {
        apps: SteamApp[];
    };
};

export type BotCallbackData = {
    success: any;
    guard: any;
    error: Error;
    twofa: any;
};

export const LocalesList = ["en-US", "ru-RU"] as const;
export type Locales = typeof LocalesList[number];

export type SteamAppLocaleRecord = {
    text: string;
    tPhs: string[];
    customPhs: string[];
};

export type SteamAppLocale = {
    records: StringMap<SteamAppLocaleRecord>;
    phValues: StringMap<string[]>;
};

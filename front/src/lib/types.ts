import { MessageSchema } from '@/plugins/i18n';
import {
    ApiErr,
    BotCallbackData,
    EventTypes as _EventTypes,
    Locales,
    SteamBotCustomTitle,
    SteamBotPersonaInfo,
    SteamImageData,
    StringMap,
} from '@shared/types';
import { PickupPaths } from 'vue-i18n';
import { EPersonaState, EResult, ESSEState } from './enums';

export type SseLoaderStateTexts = Record<
    ESSEState,
    {
        title?: string;
        header: string;
    }
>;

export type User = {
    id: number;
    username: string;
    nickname: string;
    isRoot: boolean;
    lang: Locales;
};

export type Account = {
    id: number;
    info: SteamBotPersonaInfo;
    personaState: EPersonaState;
    title: SteamBotCustomTitle;
    owner: User;
    ownerId: number;
    launched: boolean;
    appIds: number[];
    steamID: string;
    loggedIn: boolean;
    activeAppId: number;
    username: string;
    sharedWith: User[];
    lastError: keyof typeof EResult | null;
};

export type SteamApp = {
    appid: number;
    name: string;
    localeCache?: string;
};

export type EventTypes = _EventTypes<Account, User, SteamApp>;

export type SseHandler<T extends keyof EventTypes> = (
    data: EventTypes[T],
) => void;

export type ApiMethods =
    | 'get'
    | 'post'
    | 'patch'
    | 'delete'
    | 'put'
    | 'head'
    | 'options';

export type ApiResult<ReturnType = any> = {
    success: boolean;
    data: ReturnType;
    errCode?: ApiErr;
};

export type LogOnResult = {
    logOnResult: keyof BotCallbackData;
    error?: Error;
};

export type AlertModel = {
    text: TranslationSet<'alert'>;
    type: AlertType;
    error: any;
    id: string;
};

export type ModalAsyncHandler = {
    async?: true;
    handler: (e: PointerEvent) => Promise<void> | void;
};

export type ModalCloser = 'times' | 'outside';

export type LogOnModalType = 'add' | 'relogon' | 'proceed';

export type Modals = {
    LogOn: {
        initialUsername?: string;
        initialResult?: string;
        type?: LogOnModalType;
    };
    Confirm: {
        yes: ModalAsyncHandler;
        no?: ModalAsyncHandler;
        text: TranslationSet<'messageBox'>;
        plural?: true;
    };
    MessageBox: {
        text: TranslationSet<'messageBox'>;
        plural?: true;
    };
    Settings: any;
    CreateUser: {
        onCreate: (user: User) => void;
    };
};

export type ModalModel<T extends keyof Modals> = {
    header?: TranslationSet<'header'>;
    component: T;
    props: Modals[T];
    id: string;
};

export type ExtendsString<T> = T | (string & Record<never, never>);

export type TranslationKey = ExtendsString<PickupPaths<MessageSchema>>;

export type TranslationSubKey<T extends keyof MessageSchema> = ExtendsString<
    keyof MessageSchema[T]
>;

export type TranslationParams =
    | (any[] & Record<string, any>)
    | Record<string, any>;

export type TranslationSet<T extends keyof MessageSchema> =
    | [TranslationSubKey<T>, TranslationParams]
    | TranslationSubKey<T>;

export type TranslationSetNormalized = [TranslationKey, TranslationParams];

export type LogOnError = Error & {
    errCode?: string;
    eresult?: EResult;
};

export type RouteFetcher = () => Promise<'404' | '500' | false>;

export type MainBg = {
    rect: DOMRect;
    bg?: SteamImageData;
};

export type DropdownOption = {
    text: TranslationKey;
    key: string;
    bind?: StringMap<any>;
};

export type MultiselectStart = {
    x: number;
    y: number;
    selected: number[];
    type: boolean;
};

export type SoftDeletePayload = {
    id: number;
    withDeleted?: (account: Account, owner: string) => void;
};

export interface IAlertStore {
    alerts: AlertModel[];
}

export interface IModalStore {
    modals: ModalModel<any>[];
}

export type AlertType = 'error' | 'warning' | 'info' | 'default' | 'success';

export type AlertHandler = (text: TranslationSet<'alert'>, error?: any) => void;

export type AlertsPlugin = {
    show: AlertHandler;
    info: AlertHandler;
    warn: AlertHandler;
    err: AlertHandler;
    success: AlertHandler;
};

export type ModalsPlugin = {
    show: <T extends keyof Modals>(
        modal: T,
        props?: ModalModel<T>['props'],
        header?: TranslationSet<'header'>,
    ) => void;

    confirm: (
        text: TranslationSet<'messageBox'>,
        yes: ModalAsyncHandler['handler'],
        no?: ModalAsyncHandler,
        plural?: true,
    ) => void;

    confirmAsync: (
        text: TranslationSet<'messageBox'>,
        yes: ModalAsyncHandler['handler'],
        no?: ModalAsyncHandler,
        plural?: true,
    ) => void;

    message: (text: TranslationSet<'messageBox'>, plural?: true) => void;
};

export type AccountMutation = {
    id: number;
    action: (acc: Account) => void;
};

export type StatsMeta = {
    type: string;
    totalmem: number;
    uptime: number;
    cfg: Record<string, any>;
};

export type CPUInfo = {
    model: string;
    speed: number;
    times: {
        user: number;
        nice: number;
        sys: number;
        idle: number;
        irq: number;
    };
};

export type UpdateStatsMeta = {
    freemem: number;
    accounts: number;
    launched: number;
    cpus0: Array<CPUInfo>;
    cpus1: Array<CPUInfo>;
};

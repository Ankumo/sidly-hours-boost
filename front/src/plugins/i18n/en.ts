import {
    EAccountStatus,
    EAccountTab,
    EGameCardAction,
    EGamesAction,
    EPersonaState,
    EResult,
    ESettingsRootTab,
    ESettingsTab,
    ESSEState,
} from '@/lib/enums';
import { LogOnModalType } from '@/lib/types';
import { ApiErr, Locales, SteamBotCustomTitle } from '@shared/types';

export default {
    btn: {
        logOn: {
            add: 'Add',
            proceed: 'Proceed',
            relogon: 'Confirm',
        } as Record<LogOnModalType, string>,
        addAccount: 'Add account',
        reconnectNow: 'Reconnect now',
        add: 'Add',
        stopBoost: 'Stop boost',
        startBoost: 'Start boost',
        accountProceed: 'Proceed',
        _logOn: 'Log on',
        logOff: 'Log off',
        yes: 'Yes',
        no: 'No',
        ok: 'OK',
        deleteAccount: 'Delete account',
        logOnContinue: 'Continue Log On',
        signIn: 'Sign in',
        share: 'Share',
        save: 'Save',
        changePassword: 'Change password',
        createUser: 'Create new',
        create: 'Create',
    },
    ph: {
        password: 'Password',
        username: 'Username',
        code: 'Code',
        status: 'Status: {0}',
        addGame: 'Add a game',
        selectedGames: 'Selected {0} game | Selected {0} games',
        nickname: 'Nickname',
        oldPassword: 'Current password',
        newPassword: 'New password',
        newPasswordConfirm: 'Confirm new password',
        customTitleType: 'Title type: {0}',
        title: 'Title',
        mainKey: 'Main key: {0}',
        pleaseSelect: 'Please select',
    },
    header: {
        logOn: {
            add: 'Adding new account',
            proceed: 'Steam Guard',
            relogon: "Confirm account '{0}' password",
        } as Record<LogOnModalType, string>,

        confirmDefault: 'Confirm your action',
        messageBoxDefault: 'Message',
        gamesHelp: 'Games management help',
        settings: 'Settings',
        createUser: 'Create new user',
    },
    messageBox: {
        removeGames:
            'Are you sure you want to remove {0} game? | Are you sure you want to remove {0} games?',
        gamesHelp:
            'Hold LMB on an empty space and then move your mouse around to easily multiselect games. You can hold Ctrl key to alt multiselection tool. Ctrl key also allows you to select / deselect game by just clicking on card',
        removeAccount: "Are you sure you want to remove account '{0}'?",
        unshare:
            "Are you sure you want to unshare account '{0}' for user '{1}'?",
        deleteUser: "Are you sure you want to delete user '{0}'?",
        resetPassword: "Are you sure you want to reset password of user '{0}'?",
        userNewPassword: "User '{0}' new password: '{1}'",
    },
    alert: {
        apiErr: {
            [ApiErr.AccountNotFound]: 'Account was not found',
            [ApiErr.AccountIsPrivate]:
                'Unable to get owned games. Profile is private and currently not logged in by Sidly',
            [ApiErr.BotBlocked]: 'Account is already in use',
            [ApiErr.BotLogonError]: 'Unable to log in. Error code: {0}',
            [ApiErr.BotNoSteamId]:
                "Unable to get owned games. This account has not received it's SteamID yet",
            [ApiErr.NoAppIds]:
                'No games has been added to boost on this account',
            [ApiErr.NoOnlineBots]:
                'Sidly have no online bots now, please log into at least one and try again',
            [ApiErr.OldPasswordIncorrect]: 'Incorrect old password',
            [ApiErr.SteamApiError]: 'Unexpected Steam API error',
            [ApiErr.Unexpected]: 'Unexpected error occurred',
            [ApiErr.UserAlreadyExists]: 'User with this name already exists',
            [ApiErr.UserNotFound]: 'User was not found',
            [ApiErr.UsernameNotFound]: 'User with this name was not found',
            [ApiErr.AccountNotYours]:
                'This account is not seems to belong to you. You can try to ask an owner to share it',
            [ApiErr.AccountAlreadyExists]: 'This account is alredy exists',
            [ApiErr.BotNeedRelogon]:
                'Your credentials are no longer valid. Please try to relog on',
            [ApiErr.CannotDeleteRootUser]: 'Root user cannot be deleted',
            [ApiErr.InvalidPassword]: 'Invalid password and / or username',
            [ApiErr.TooMuchApps]: 'Maximum apps per account limit exceeded',
            [ApiErr.TooMuchActiveAccounts]:
                "There's too much active bots on this server at the moment",
            [ApiErr.TooMuchAccounts]:
                'Maximum accounts per user limit exceeded',
            [ApiErr.TooMuchYourActiveAccounts]:
                'Maximum active bots per user limit exceeded',
        } as Record<ApiErr, string>,

        error: {
            eResult: {
                [EResult.InvalidPassword]: 'Invalid password and / or username',
            },

            noAccountWithSuccess:
                'No account has been received from the request. It was success though... Try to reload this page',
            http: 'Unexpected HTTP error occurred',
            guardCodeIncorrect: 'Invalid Steam Guard code',
            logOnUnexpected: 'Unexpected Log On related error occurred',
        },

        noAlertErr: 'No additional information specified',
        accountAdded: "Account '{0}' has been added successfully",
        accountUnshared: "Account '{0}' from user '{1}' has been unshared",
        accountDeleted: "Account '{0}' has been successfully deleted",
        accountShared: "User '{0}' has shared account '{1}' for you",
        successfullyLoggedIn: 'Successfully signed in',
        passwordChanged: 'Your password has been successfully changed',
        profileUpdated: 'Your preferences has been successfully updated',
        userCreated: "User '{0}' has been successfully created",
        userDeleted: "User '{0}' has been successfully deleted",
        userPasswordResetted:
            "User '{0}' password has been successfully resetted",
        shareUserDeleted:
            "User '{0}' was deleted from Sidly. Shared accounts no longer available",
        sharedAccountDeleted: "Account '{0}' has been deleted by its owner",
        richPresenceLoop:
            'This placeholder led us to infinite loop. It may be caused by poor game rich presence keys development or wrong Sidly analysis. Please select something else',
        titleUpdated: "Account '{0}' title has been successfully updated",
    },
    other: {
        welcome: 'Welcome, {0}',
        backToHome: 'Back to Home',
        myAccounts: 'My accounts',
        provideEmailCode: 'Please, provide your E-Mail code',
        provideGuardCode: 'Please, provide your Steam Guard code',
        mainApp: 'Main',
        accountDeleteHelp:
            "Warning! This action cannot be cancelled. Please type '{0}' here to confirm (case-sensitive)",
        deleteKeyword: 'Delete',
        keywordIncorrect: 'Invalid keyword',
        signInWelcome: 'Welcome to Sidly',
        shareHelp:
            'You can share this account with any Sidly user. These users cannot re-share nor delete it',
        accountSharedWith: 'This account has been shared with',
        accountSharedBy: 'Shared by: {0}',
        selectedApp: 'Selected main app: {0}',
        appRPLoadingError:
            'Unable to load rich presence data for selected main app',
        noRPFound: 'No rich presence data found for this app',
        rpTPhs: 'Selectable placeholders',
        tpCustomPhs: 'Customizable placeholders',
        friends: 'Friends',
        developedBy: 'Ankumo was here',
        '404': 'Page not found',
        '500': 'Internal server error',
        undef: 'N/A',
    },
    noItems: {
        games: 'No games to boost yet',
        emptyGameSearch: 'Type here to search games',
        noGamesFound: 'Nothing found :(',
        noSharedUsers: "This account wasn't shared with anyone yet",
        noUsers: "There's only you on this Sidly server",
        usersError: 'Failed to fetch users list',
        noAccounts: 'No accounts here yet',
    },
    label: {
        owned: 'Owned only',
    },
    title: {
        markGame: 'Set as main',
        signOut: 'Sign out',
        settings: 'Open settings',
        gameManagementHelp: 'Game management tips',
        resetPassword: 'Reset password',
        deleteUser: 'Delete user',
    },
    sse: {
        [ESSEState.ERROR]: {
            header: 'Connection failed',
            title: 'Reconnecting in {n} second... | Reconnecting in {n} seconds...',
        },
        [ESSEState.CLOSED]: {
            header: 'Connection closed',
        },
        [ESSEState.LOADING]: {
            header: 'Loading',
            title: 'Connecting to events service...',
        },
        [ESSEState.CONNECTED]: {
            header: 'Successfully connected',
        },
    },
    accountStatus: {
        [EAccountStatus.Boosting]: 'Boosting',
        [EAccountStatus.InGame]: 'In game',
        [EAccountStatus.Offline]: 'Offline',
        [EAccountStatus.Online]: 'Online',
    },
    personaState: {
        [EPersonaState.Away]: 'Away',
        [EPersonaState.Busy]: 'Busy',
        [EPersonaState.LookingToTrade]: 'Looking to Trade',
        [EPersonaState.LookingToPlay]: 'Looking to Play',
        [EPersonaState.Invisible]: 'Invisible',
        [EPersonaState.Offline]: 'Offline',
        [EPersonaState.Online]: 'Online',
        [EPersonaState.Snooze]: 'Snooze',
    } as Record<EPersonaState, string>,
    accountTitle: {
        boostingSmall: 'Boosting {n} game | Boosting {n} games',
        boosting_1: 'Boosting {game1}',
        boosting_2: 'Boosting {game1} and {game2}',
        boosting_3: 'Boosting {game1}, {game2} and {game3}',
        boosting_n:
            'Boosting {game1}, {game2} and {count} more | Boosting {game1}, {game2} and {count} more',
        playing: 'In-Game {0}',
        notComplete: "This account has not yet completed it's Log On procedure",
    },
    accountTab: {
        [EAccountTab.GamesList]: 'Games',
        [EAccountTab.Title]: 'Rich Presence',
        [EAccountTab.Share]: 'Share',
        [EAccountTab.Delete]: 'Delete account',
    } as Record<EAccountTab, string>,
    gamesAction: {
        [EGamesAction.CANCEL]: 'Cancel selection',
        [EGamesAction.REMOVE]: 'Remove',
        [EGamesAction.SELECT_ALL]: 'Select all',
    } as Record<EGamesAction, string>,
    settingsTab: {
        [ESettingsTab.PREFERENCES]: 'Preferences',
        [ESettingsTab.CHANGE_PASSWORD]: 'Change password',
        [ESettingsTab.ABOUT]: 'About',
    } as Record<ESettingsTab, string>,
    settingsRootTab: {
        [ESettingsRootTab.USERS]: 'Manage users',
        [ESettingsRootTab.STATS]: 'Stats',
    } as Record<ESettingsRootTab, string>,
    cardAction: {
        [EGameCardAction.CANCEL]: 'Cancel',
        [EGameCardAction.DELETE]: 'Delete',
        [EGameCardAction.SELECT]: 'Select',
        [EGameCardAction.SET_MAIN]: 'Set as main',
        [EGameCardAction.DESELECT]: 'Deselect',
    } as Record<EGameCardAction, string>,
    lang: {
        'en-US': 'English',
        'ru-RU': 'Russian',
    } as Record<Locales, string>,
    settings: {
        administration: 'Administration',
        changeNickname: 'Change your nickname',
        language: 'App language',
        passwordConfirmIncorrect: 'Password confirmation is incorrect',
        userTableH: {
            num: '#',
            username: 'Username',
        },
        statsLoadingError: 'An error occurred while trying to get server stats',
        serverInfo: 'Server info',
        config: 'Configuration',
        cpu: 'CPU',
        cpuUsage: 'CPU Usage',
        uptime: 'Uptime',
        os: 'OS',
        ramUsage: 'RAM Usage',
        launchedAccounts: 'Active accounts',
        accountsCount: 'Accounts',
        mb: 'MB',
    },
    titleType: {
        default: 'Default',
        none: 'None',
        rich: 'Rich',
    } as Record<SteamBotCustomTitle['type'], string>,
};

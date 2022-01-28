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
            add: 'Добавить',
            proceed: 'Продолжить',
            relogon: 'Подтвердить',
        } as Record<LogOnModalType, string>,
        addAccount: 'Добавить аккаунт',
        reconnectNow: 'Переподключиться сейчас',
        add: 'Добавить',
        stopBoost: 'Остановить буст',
        startBoost: 'Запустить буст',
        accountProceed: 'Продолжить',
        _logOn: 'Войти в сеть',
        logOff: 'Выйти из сети',
        yes: 'Да',
        no: 'Нет',
        ok: 'ОК',
        deleteAccount: 'Удалить аккаунт',
        logOnContinue: 'Возобновить добавление',
        signIn: 'Войти',
        share: 'Поделиться',
        save: 'Сохранить',
        changePassword: 'Сменить пароль',
        createUser: 'Создать нового',
        create: 'Создать',
    },
    ph: {
        password: 'Пароль',
        username: 'Имя пользователя',
        code: 'Код',
        status: 'Статус: {0}',
        addGame: 'Добавить игру',
        selectedGames: 'Выбрана {0} игра | Выбрано {0} игры | Выбрано {0} игр',
        nickname: 'Никнейм',
        oldPassword: 'Текущий пароль',
        newPassword: 'Новый пароль',
        newPasswordConfirm: 'Подтверждение пароля',
        customTitleType: 'Тип надписи: {0}',
        title: 'Надпись',
        mainKey: 'Главный ключ: {0}',
        pleaseSelect: 'Выберите',
    },
    header: {
        logOn: {
            add: 'Добавление нового аккаунта',
            proceed: 'Steam Guard',
            relogon: "Подтвердите пароль от аккаунта '{0}'",
        } as Record<LogOnModalType, string>,

        confirmDefault: 'Подтверждение действия',
        messageBoxDefault: 'Системное сообщение',
        gamesHelp: 'Инструкция для списка игр',
        settings: 'Настройки',
        createUser: 'Добавление нового пользователя',
    },
    messageBox: {
        removeGames:
            'Вы действительно желаете удалить {n} игру? | Вы действительно желаете удалить {n} игры? | Вы действительно желаете удалить {n} игр?',
        gamesHelp:
            'Удерживайте ЛКМ в пустой области списка игр, чтобы выбрать несколько сразу. Зажатие клавишы Ctrl инвертирует выбор и позволяет быстро снимать выделение. Клик ЛКМ по карточке с игрой с зажатой клавишей Ctrl выделяет ее или снимает выделение',
        removeAccount: "Вы действительно желаете удалить аккаунт '{0}'?",
        unshare:
            "Are you sure you want to unshare account '{0}' for user '{1}'?",
        deleteUser: "Вы действительно желаете удалить пользователя '{0}'?",
        resetPassword:
            "Вы действительно желаете сброить пароль пользователя '{0}'?",
        userNewPassword: "Новый пароль для пользователя '{0}': '{1}'",
    },
    alert: {
        apiErr: {
            [ApiErr.AccountNotFound]: 'Аккаунт не найден',
            [ApiErr.AccountIsPrivate]:
                'Не удалось получить список игр на этом аккаунте. Возможно профиль скрыт и находится не в сети из Sidly',
            [ApiErr.BotBlocked]:
                'Аккаунт уже используется и на нем есть незакрытые приложения',
            [ApiErr.BotLogonError]: 'Не удалось войти в сеть. Код ошибки: {0}',
            [ApiErr.BotNoSteamId]:
                'Не удалось получить список игр на этом аккаунте. Он еще ни разу не входил в сеть и не получил свой SteamID',
            [ApiErr.NoAppIds]:
                'Вы не добавили ни одной игры в список для буста на этом аккаунте',
            [ApiErr.NoOnlineBots]:
                'На сервере сейчас нет ни одного подключенного аккаунта. Пожалуйста войдите в сеть хотя бы на одном и повторите попытку',
            [ApiErr.OldPasswordIncorrect]: 'Неверный текущий пароль',
            [ApiErr.SteamApiError]: 'Произошла неизвестная ошибка Steam API',
            [ApiErr.Unexpected]: 'Произошла неизвестная ошибка',
            [ApiErr.UserAlreadyExists]:
                'Пользователь с таким именем уже существует',
            [ApiErr.UserNotFound]: 'Пользователь не найден',
            [ApiErr.UsernameNotFound]: 'Пользователь с таким именем не найден',
            [ApiErr.AccountNotYours]:
                'Этот аккаунт уже был добавлен другим пользователем. Можете попробовать попросить его поделиться им с вами',
            [ApiErr.AccountAlreadyExists]: 'Этот аккаунт уже существует',
            [ApiErr.BotNeedRelogon]:
                'Указанные вами данные более не действительны. Попробуйте войти заново',
            [ApiErr.CannotDeleteRootUser]: 'Нельзя удалить администратора',
            [ApiErr.InvalidPassword]: 'Неверное имя пользователя и/или пароль',
            [ApiErr.TooMuchApps]: 'Вы превысили лимит игр для одного аккаунта',
            [ApiErr.TooMuchActiveAccounts]:
                'Превышен лимит активных аккаунтов на сервере',
            [ApiErr.TooMuchAccounts]:
                'Превышен лимит аккаунтов для вашего пользователя',
            [ApiErr.TooMuchYourActiveAccounts]:
                'Превышен лимит активных аккаунтов для вашего пользователя',
        } as Record<ApiErr, string>,

        error: {
            eResult: {
                [EResult.InvalidPassword]:
                    'Неверное имя пользователя и/или пароль',
            },

            noAccountWithSuccess:
                'Не удалось получить информацию об аккаунте, но запрос был успешно отправлен. Это странно, попробуйте перезагрузить страницу',
            http: 'Произошла неизвестная ошибка HTTP',
            guardCodeIncorrect: 'Неверный код Steam Guard',
            logOnUnexpected: 'Произошла неизвестная ошибка сети входа в Steam',
        },

        noAlertErr: 'Нет дополнительной информации',
        accountAdded: "Аккаунт '{0}' был успешно добавлен",
        accountUnshared:
            "Пользователь '{1}' отменил общий доступ к аккаунту '{0}' для вас",
        accountDeleted: "Аккаунт '{0}' был успешно удален",
        accountShared: "Пользователь '{0}' поделился аккаунтом '{1}' с вами",
        successfullyLoggedIn: 'Вы успешно вошли в свой аккаунт',
        passwordChanged: 'Ваш пароль был успешно изменен',
        profileUpdated: 'Ваши параметры были успешно обновлены',
        userCreated: "Пользователь '{0}' был успешно создан",
        userDeleted: "Пользователь '{0}' был успешно удален",
        userPasswordResetted: "Пароль пользователя '{0}' был успешно сброшен",
        shareUserDeleted:
            "Пользователь '{0}' удален из Sidly. Аккаунты, которыми он с вами поделился более недоступны",
        sharedAccountDeleted: "Аккаунт '{0}' был удален владельцем",
        richPresenceLoop:
            'Выбранное вами значение переменной привело к зацикливанию формирования надписи. Такое случается, если разработчики игры не совсем удачно придумали названия для переменных или если алгоритм анализа переменных в Sidly допустил ошибку. Пожалуйста, выберите другое значение',
        titleUpdated:
            "Настройки надписи для аккаунта '{0}' были успешно обновлены",
    },
    other: {
        welcome: 'Привет, {0}',
        backToHome: 'На главную',
        myAccounts: 'Мои аккаунты',
        provideEmailCode: 'Введите код из E-Mail',
        provideGuardCode: 'Введите код Steam Guard',
        mainApp: 'Основная',
        accountDeleteHelp:
            "Внимание! Это действие невозможно отменить. Пожалуйста, введите слово '{0}' в поле для подтверждения (учитывая регистр)",
        deleteKeyword: 'Удалить',
        keywordIncorrect: 'Неверное проверочное слово',
        signInWelcome: 'Добро пожаловать в Sidly',
        shareHelp:
            'Вы можете поделиться данным аккаунтом с любым пользователем Sidly. Пользователи не смогут удалить ваш аккаунт с этого сервера или поделиться им с кем-то еще',
        accountSharedWith: 'Вы поделились этим аккаунтом с',
        accountSharedBy: 'Поделился: {0}',
        selectedApp: 'Основная игра: {0}',
        appRPLoadingError:
            'Не удалось загрузить данные о Rich Presence для выбранной вами основной игры',
        noRPFound: 'Данная игра не поддерживает Rich Presence',
        rpTPhs: 'Переключаемые переменные',
        tpCustomPhs: 'Настраиваемые переменные',
        friends: 'Друзья',
        developedBy: 'Ankumo was here',
        '404': 'Страница не найдена',
        '500': 'Произошла внутренняя ошибка сервера',
        undef: 'Н/Д',
    },
    noItems: {
        games: 'Нет добавленных игр для буста',
        emptyGameSearch: 'Начните ввод, чтобы найти игру',
        noGamesFound: 'Ничего не найдено :(',
        noSharedUsers: 'Вы еще не поделились этим аккаунтом с кем-либо',
        noUsers: 'Кроме вас на этом сервере никого нет',
        usersError: 'Не удалось загрузить список пользователей',
        noAccounts: 'Здесь пока еще нет аккаунтов',
    },
    label: {
        owned: 'Только собств.',
    },
    title: {
        markGame: 'Сделать основной',
        signOut: 'Выйти',
        settings: 'Открыть настройки',
        gameManagementHelp: 'Подсказки для управления списком игр',
        resetPassword: 'Сбросить пароль',
        deleteUser: 'Удалить пользователя',
    },
    sse: {
        [ESSEState.ERROR]: {
            header: 'Ошибка соединения',
            title: 'Повторная попытка подключения через {n} секунду... | Повторная попытка подключения через {n} секунды... | Повторная попытка подключения через {n} секунд...',
        },
        [ESSEState.CLOSED]: {
            header: 'Соединение прервано',
        },
        [ESSEState.LOADING]: {
            header: 'Соединение',
            title: 'Подключение к сервису событий...',
        },
        [ESSEState.CONNECTED]: {
            header: 'Вы успешно подключены',
        },
    },
    accountStatus: {
        [EAccountStatus.Boosting]: 'Активный',
        [EAccountStatus.InGame]: 'В игре',
        [EAccountStatus.Offline]: 'Не в сети',
        [EAccountStatus.Online]: 'В сети',
    },
    personaState: {
        [EPersonaState.Away]: 'Нет на месте',
        [EPersonaState.Busy]: 'Не беспокоить',
        [EPersonaState.LookingToTrade]: 'Хочет обменяться',
        [EPersonaState.LookingToPlay]: 'Хочет играть',
        [EPersonaState.Invisible]: 'Невидимка',
        [EPersonaState.Offline]: 'Не в сети',
        [EPersonaState.Online]: 'В сети',
        [EPersonaState.Snooze]: 'Спит',
    } as Record<EPersonaState, string>,
    accountTitle: {
        boostingSmall:
            'На бусте {n} игра | На бусте {n} игры | На бусте {n} игр',
        boosting_1: 'Буст {game1}',
        boosting_2: 'Буст {game1} и {game2}',
        boosting_3: 'Буст {game1}, {game2} и {game3}',
        boosting_n:
            'Буст {game1}, {game2} и еще {count} игра | Буст {game1}, {game2} и еще {count} игры | Буст {game1}, {game2} и еще {count} игр',
        playing: 'В игре {0}',
        notComplete: 'Этот аккаунт еще не завершил процедуру входа в аккаунт',
    },
    accountTab: {
        [EAccountTab.GamesList]: 'Игры',
        [EAccountTab.Title]: 'Надпись',
        [EAccountTab.Share]: 'Поделиться',
        [EAccountTab.Delete]: 'Удаление аккаунта',
    } as Record<EAccountTab, string>,
    gamesAction: {
        [EGamesAction.CANCEL]: 'Отменить выделение',
        [EGamesAction.REMOVE]: 'Удалить',
        [EGamesAction.SELECT_ALL]: 'Выбрать все',
    } as Record<EGamesAction, string>,
    settingsTab: {
        [ESettingsTab.PREFERENCES]: 'Параметры',
        [ESettingsTab.CHANGE_PASSWORD]: 'Смена пароля',
        [ESettingsTab.ABOUT]: 'О приложении',
    } as Record<ESettingsTab, string>,
    settingsRootTab: {
        [ESettingsRootTab.USERS]: 'Управление пользователями',
        [ESettingsRootTab.STATS]: 'Статистика',
    } as Record<ESettingsRootTab, string>,
    cardAction: {
        [EGameCardAction.CANCEL]: 'Отмена',
        [EGameCardAction.DELETE]: 'Удалить',
        [EGameCardAction.SELECT]: 'Выбрать',
        [EGameCardAction.SET_MAIN]: 'Сделать основной',
        [EGameCardAction.DESELECT]: 'Снять выбор',
    } as Record<EGameCardAction, string>,
    lang: {
        'en-US': 'Английский',
        'ru-RU': 'Русский',
    } as Record<Locales, string>,
    settings: {
        administration: 'Администрирование',
        changeNickname: 'Смена никнейма',
        language: 'Язык приложения',
        passwordConfirmIncorrect: 'Пароли не совпадают',
        userTableH: {
            num: '№',
            username: 'Имя пользователя',
        },
        statsLoadingError:
            'Произошла ошибка при попытке получить информацию о статистике сервера',
        serverInfo: 'Сервер',
        config: 'Конфигурация',
        cpu: 'ЦПУ',
        cpuUsage: 'Нагрузка ЦПУ',
        uptime: 'Аптайм',
        os: 'ОС',
        ramUsage: 'Нагрузка ОЗУ',
        launchedAccounts: 'Активных аккаунтов',
        accountsCount: 'Аккаунтов',
        mb: 'МБ',
    },
    titleType: {
        default: 'По умолчанию',
        none: 'Нет',
        rich: 'Rich Presence',
    } as Record<SteamBotCustomTitle['type'], string>,
};

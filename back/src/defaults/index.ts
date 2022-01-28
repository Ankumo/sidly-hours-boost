import { SteamBotCustomTitle, SteamBotPersonaInfo } from '@shared/types';
import config from 'src/utils/config';

export const defaultCustomTitle: SteamBotCustomTitle = {
    placeholders: {},
    title:
        'Boosting hours with Sidly service' +
        (config.domain ? ` @${config.domain}` : ''),
    type: 'default',
    mainApp: 0,
};

export const defaultPersonaInfo: SteamBotPersonaInfo = {
    name: '',
    bg: null,
    frame: null,
    miniBg: null,
    avatar: '',
};

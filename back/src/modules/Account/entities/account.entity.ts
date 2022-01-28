import { DefaultEntity } from 'src/defaults/entity';
import { User } from 'src/modules/User/entities/user.entity';
import {
    AfterInsert,
    AfterLoad,
    AfterUpdate,
    BeforeInsert,
    BeforeUpdate,
    Column,
    DeepPartial,
    Entity,
    JoinColumn,
    ManyToMany,
    ManyToOne,
} from 'typeorm';
import { EPersonaState, EResult } from 'steam-user';
import { defaultCustomTitle, defaultPersonaInfo } from 'src/defaults';
import { SteamBotCustomTitle, SteamBotPersonaInfo } from '@shared/types';

const jsonFields: DeepPartial<Account> = {
    appIds: [],
    title: defaultCustomTitle,
    info: defaultPersonaInfo,
};

@Entity('account')
export class Account extends DefaultEntity {
    @Column()
    username: string;

    @Column({ type: 'text', default: JSON.stringify(defaultPersonaInfo) })
    _info: string;
    info: SteamBotPersonaInfo;

    @Column({ nullable: true })
    loginKey: string;

    @Column({ default: EPersonaState.Online })
    personaState: EPersonaState;

    @Column({ type: 'text', default: JSON.stringify(defaultCustomTitle) })
    _title: string;
    title: SteamBotCustomTitle;

    @ManyToOne(() => User, (user) => user.accounts, {
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    })
    @JoinColumn()
    owner: User;

    @Column()
    ownerId: number;

    @ManyToMany(() => User, (user) => user.sharedAccounts, {
        cascade: true,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    sharedWith: User[];

    @Column({ default: false })
    launched: boolean;

    @Column({ type: 'text', default: '[]' })
    _appIds: string;
    appIds: number[];

    @Column({ nullable: true })
    steamID: string;

    @Column({ default: null, type: 'text', nullable: true })
    lastError: keyof typeof EResult | null;

    password: string | null = null;

    loggedIn: boolean;

    activeAppId: number;

    @AfterLoad()
    @AfterUpdate()
    @AfterInsert()
    afterLoad() {
        Object.keys(jsonFields).forEach((k) => {
            const _k = `_${k}`;
            if (this[_k] === undefined) {
                return;
            }

            try {
                this[k] = JSON.parse(this[_k] as any);
            } catch {
                this[k] = jsonFields[k];
            }
        });
    }

    @BeforeInsert()
    @BeforeUpdate()
    beforeInsert() {
        Object.keys(jsonFields).forEach((k) => {
            const _k = `_${k}`;
            if (this[_k] === undefined) {
                return;
            }

            try {
                this[_k] = JSON.stringify(this[k]);
            } catch {
                this[_k] = JSON.stringify(jsonFields[k]);
            }
        });
    }
}

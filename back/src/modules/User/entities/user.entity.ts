import appConfig from 'src/utils/config';
import { DefaultEntity } from 'src/defaults/entity';
import { Account } from 'src/modules/Account/entities/account.entity';
import {
    AfterLoad,
    Column,
    Entity,
    JoinTable,
    ManyToMany,
    OneToMany,
} from 'typeorm';
import { UserSession } from './user-session.entity';
import { Locales } from '@shared/types';

@Entity('user')
export class User extends DefaultEntity {
    @Column()
    nickname: string;

    @Column()
    username: string;

    @Column({ select: false })
    password: string;

    @Column({ type: 'text', default: 'en-US' })
    lang: Locales;

    @OneToMany(() => Account, (acc) => acc.owner, {
        eager: true,
        cascade: true,
    })
    accounts: Account[];

    @ManyToMany(() => Account, (acc) => acc.sharedWith, {
        eager: true,
    })
    @JoinTable()
    sharedAccounts: Account[];

    @OneToMany(() => UserSession, (us) => us.user, {
        cascade: true,
    })
    sessions: UserSession[];

    isRoot: boolean;

    @AfterLoad()
    afterLoad() {
        this.isRoot = appConfig.rootUser === this.username;
    }
}

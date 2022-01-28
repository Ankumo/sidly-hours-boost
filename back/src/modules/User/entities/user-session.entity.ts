import { DefaultEntity } from 'src/defaults/entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity('user-session')
export class UserSession extends DefaultEntity {
    @ManyToOne(() => User, (user) => user.sessions, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    user: User;

    @Column()
    hash: string;

    @Column()
    expires: Date;
}

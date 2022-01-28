import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('steam-app')
export class SteamApp extends BaseEntity {
    @PrimaryColumn()
    appid: number;

    @Column()
    name: string;

    @Column({ default: '', nullable: true })
    localeCache: string;
}

import { DefaultEntity } from 'src/defaults/entity';
import { Column, Entity } from 'typeorm';

@Entity('metadata')
export class Metadata extends DefaultEntity {
    @Column({ default: 0 })
    lastGamesUpdate: number;
}

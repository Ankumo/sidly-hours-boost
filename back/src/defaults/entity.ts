import { BaseEntity, PrimaryGeneratedColumn } from 'typeorm';

export class DefaultEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;
}

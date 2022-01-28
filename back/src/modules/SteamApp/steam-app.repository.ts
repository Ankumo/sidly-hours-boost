import { EntityRepository, Repository } from 'typeorm';
import { SteamApp } from './entities/steam-app.entity';

@EntityRepository(SteamApp)
export class SteamAppRepository extends Repository<SteamApp> {}

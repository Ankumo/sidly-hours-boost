import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountModule } from '../Account/account.module';
import { MetadataModule } from '../Metadata/metadata.module';
import { SteamApiModule } from '../SteamApi/steam-api.module';
import { SteamAppController } from './steam-app.controller';
import { SteamAppRepository } from './steam-app.repository';
import { SteamAppService } from './steam-app.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([SteamAppRepository]),
        SteamApiModule,
        AccountModule,
        MetadataModule,
    ],
    exports: [SteamAppService],
    controllers: [SteamAppController],
    providers: [SteamAppService],
})
export class SteamAppModule {}

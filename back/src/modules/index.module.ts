import { Module } from '@nestjs/common';
import { ModuleMetadata } from '@nestjs/common/interfaces/modules/module-metadata.interface';
import { AccountModule } from './Account/account.module';
import { AuthModule } from './Auth/auth.module';
import { EventsModule } from './Events/events.module';
import { MetadataModule } from './Metadata/metadata.module';
import { SteamApiModule } from './SteamApi/steam-api.module';
import { SteamAppModule } from './SteamApp/steam-app.module';
import { UserModule } from './User/user.module';

const imports: ModuleMetadata['imports'] = [
    UserModule,
    AuthModule,
    AccountModule,
    EventsModule,
    SteamApiModule,
    SteamAppModule,
    MetadataModule,
];

@Module({
    imports,
    exports: imports,
})
export default class IndexModule {}

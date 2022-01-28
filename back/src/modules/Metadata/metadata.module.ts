import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MetadataController } from './metadata.controller';
import { MetadataRepository } from './metadata.repository';
import { MetadataService } from './metadata.service';

@Module({
    imports: [TypeOrmModule.forFeature([MetadataRepository])],
    exports: [MetadataService],
    controllers: [MetadataController],
    providers: [MetadataService],
})
export class MetadataModule {}

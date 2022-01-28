import { Controller, Get, Patch } from '@nestjs/common';
import { RootAuth } from 'src/utils/decorators';
import { MetadataService } from './metadata.service';

@Controller('metadata')
export class MetadataController {
    constructor(private service: MetadataService) {}

    @RootAuth()
    @Get('stats')
    async getStats() {
        return this.service.getStats();
    }

    @RootAuth()
    @Patch('stats')
    async updateStats() {
        return this.service.updateStats();
    }
}

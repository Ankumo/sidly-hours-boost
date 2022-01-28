import { EntityRepository, Repository } from 'typeorm';
import { Metadata } from './entities/metadata.entity';

@EntityRepository(Metadata)
export class MetadataRepository extends Repository<Metadata> {}

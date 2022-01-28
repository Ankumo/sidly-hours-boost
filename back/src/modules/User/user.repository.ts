import { EntityRepository, Repository } from 'typeorm';
import { User } from './entities/user.entity';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
    async findBySession(sessionHash: string) {
        return this.createQueryBuilder('u')
            .leftJoin('u.sessions', 'us')
            .where(`us.hash = :sessionHash`, { sessionHash })
            .loadAllRelationIds({
                relations: ['accounts', 'sharedAccounts'],
            })
            .getOne();
    }

    async findById(id: number) {
        return this.findOne({
            select: ['id'],
            where: {
                id,
            },
        });
    }
}

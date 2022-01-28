import { EntityRepository, Repository } from 'typeorm';
import { Account } from './entities/account.entity';

@EntityRepository(Account)
export class AccountRepository extends Repository<Account> {
    botAccountQuery() {
        const fields: Array<keyof Account> = [
            'id',
            '_appIds',
            '_title',
            'username',
            '_info',
            'loginKey',
            'launched',
            'ownerId',
            'steamID',
            'personaState',
            'lastError',
        ];

        return this.createQueryBuilder('a')
            .select(fields.map((f) => `a.${f}`))
            .leftJoin('a.owner', 'owner')
            .addSelect(['owner.username', 'owner.id']);
    }

    async getAllUsers(id: number): Promise<number[]> {
        const account = await this.findOne({
            where: {
                id,
            },
            select: ['ownerId'],
            loadRelationIds: {
                relations: ['sharedWith'],
            },
        });

        if (!account) {
            return [];
        }

        return [account.ownerId, ...(account.sharedWith as any)];
    }

    getAccountsCount(ownerId: number) {
        return this.count({
            where: {
                ownerId,
            },
        });
    }

    getActiveAccountsCount(ownerId: number) {
        return this.count({
            where: {
                ownerId,
                launched: true,
            },
        });
    }
}

import { Model, Q, Query } from '@nozbe/watermelondb';
import {
    children,
    date,
    field,
    lazy,
    reader,
    readonly,
    text,
    writer,
} from '@nozbe/watermelondb/decorators';
// Avoid importing database at module top-level to prevent require cycles.
// Use type-only imports for models to keep runtime dependencies light.
import type { Business, Session, Store } from '..';

export default class User extends Model {
    static table = 'users';
    static associations = {
        sessions: { type: 'has_many' as const, foreignKey: 'user_id' },
        businesses: { type: 'has_many' as const, foreignKey: 'owner_id' },
        managed_stores: { type: 'has_many' as const, foreignKey: 'manager_id' },
    };

    @field('external_id') externalId!: string;
    @text('email') email!: string;
    @text('name') name!: string;
    @text('phone') phone!: string;
    @text('password_hash') passwordHash!: string;
    @text('pin_hash') pinHash!: string;
    @readonly @date('created_at') createdAt!: Date;
    @readonly @date('updated_at') updatedAt!: Date;
    @field('deleted') deleted!: boolean;
    @field('is_owner') isOwner!: boolean;

    // Relations
    @children('sessions') sessions!: Query<Session>;
    @children('businesses') ownedBusinesses!: Query<Business>;
    @children('stores') managedStores!: Query<Store>;

    // Computed properties
    get isActive(): boolean {
        return !this.deleted;
    }

    get fullName(): string {
        return this.name;
    }
    @lazy ownerActiveBusinesses = this.ownedBusinesses.extend(Q.where('deleted', false));
    @lazy activeManagedStores = this.managedStores.extend(
        Q.where('deleted', false),
        Q.where('status', 'active'),
    );
    // Writers
    @writer async markAsDeleted() {
        await this.update((user) => {
            user.deleted = true;
        });
    }
    @writer async updateUserInfo({
        name,
        email,
        phone,
        isOwner,
    }: {
        name?: string;
        email?: string;
        phone?: string;
        isOwner?: boolean;
    }) {
        const { database } = await import('..');
        await database.write(async () => {
            await this.update((user) => {
                if (name !== undefined) user.name = name;
                if (email !== undefined) user.email = email;
                if (phone !== undefined) user.phone = phone;
                if (isOwner !== undefined) user.isOwner = isOwner;
            });
        });
    }

    @writer async updateCredentials({
        passwordHash,
        pinHash,
    }: {
        passwordHash?: string;
        pinHash?: string;
    }) {
        await this.update((user) => {
            if (passwordHash !== undefined) user.passwordHash = passwordHash;
            if (pinHash !== undefined) user.pinHash = pinHash;
        });
    }
    @reader static async userBusiness(userId: string) {
        const { database } = await import('..');
        return await database
            .get<Business>('businesses')
            .query(Q.where('owner_id', userId))
            .fetch();
    }

    // Readers
    @reader static async findByEmail(email: string) {
        const { database } = await import('..');
        const users = await database
            .get<User>('users')
            .query(Q.where('email', email.trim()), Q.where('deleted', false))
            .fetch();
        return users[0] || null;
    }

    @reader static async findByExternalId(externalId: string) {
        const { database } = await import('..');
        const users = await database
            .get<User>('users')
            .query(Q.where('external_id', externalId), Q.where('deleted', false))
            .fetch();
        return users[0] || null;
    }
    @reader static async findByUserById(id: string) {
        const { database } = await import('..');
        const users = await database
            .get<User>('users')
            .query(Q.where('id', id), Q.where('deleted', false))
            .fetch();
        return users[0] || null;
    }

    @reader static async findOwners() {
        const { database } = await import('..');
        return await database
            .get<User>('users')
            .query(Q.where('is_owner', true), Q.where('deleted', false))
            .fetch();
    }

    // @reader static async OwnedBusinesses() {
    //     const business = await this.userBusiness;
    // }

    @reader static async searchUsers(searchTerm: string) {
        const { database } = await import('..');
        return await database
            .get<User>('users')
            .query(
                Q.where('deleted', false),
                Q.or(
                    Q.where('name', Q.like(`%${Q.sanitizeLikeString(searchTerm)}%`)),
                    Q.where('email', Q.like(`%${Q.sanitizeLikeString(searchTerm)}%`)),
                    Q.where('phone', Q.like(`%${Q.sanitizeLikeString(searchTerm)}%`)),
                ),
            )
            .fetch();
    }

    @reader async isEmailTaken(excludeUserId?: string) {
        const { database } = await import('..');
        let query = database
            .get<User>('users')
            .query(Q.where('email', this.email), Q.where('deleted', false));

        if (excludeUserId) {
            query = query.extend(Q.where('id', Q.notEq(excludeUserId)));
        }

        const users = await query.fetch();
        return users.length > 0;
    }
}

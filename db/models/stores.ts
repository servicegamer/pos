import { Model, Relation } from '@nozbe/watermelondb';
import { date, field, readonly, relation, text, writer } from '@nozbe/watermelondb/decorators';
import type Business from './business';
import type User from './users';
// avoid importing database at top-level to prevent require cycles
// import { database } from '..';

export default class Store extends Model {
    static table = 'stores';
    static associations = {
        businesses: { type: 'belongs_to' as const, key: 'business_id' },
        users: { type: 'belongs_to' as const, key: 'manager_id' },
    };

    @field('external_id') externalId!: string;
    @text('name') name!: string;
    @text('address') address!: string;
    @text('phone') phone!: string;
    @text('email') email!: string;
    @text('status') status!: string;
    @text('currency') currency!: string;
    @readonly @date('created_at') createdAt!: Date;
    @readonly @date('updated_at') updatedAt!: Date;
    @field('deleted') deleted!: boolean;

    // Relations
    @relation('businesses', 'business_id') business!: Relation<Business>;
    @relation('users', 'manager_id') manager!: Relation<User>;

    // Computed properties
    get isActive(): boolean {
        return this.status === 'active' && !this.deleted;
    }

    get displayName(): string {
        return this.name;
    }

    // Writers
    @writer async markAsDeleted() {
        await this.update((store) => {
            store.deleted = true;
        });
    }

    @writer async updateStatus(status: string) {
        await this.update((store) => {
            store.status = status;
        });
    }
}

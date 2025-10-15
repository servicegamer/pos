import { Model, Relation } from '@nozbe/watermelondb';
import { field, relation, text, writer } from '@nozbe/watermelondb/decorators';
import Business from './business';

export default class Role extends Model {
    static table = 'roles';
    static associations = {
        businesses: { type: 'belongs_to' as const, key: 'business_id' },
    };

    @field('external_id') externalId!: string;
    @text('name') name!: string;
    @field('permissions') permissions!: string;
    @field('deleted') deleted!: boolean;

    @relation('businesses', 'business_id') business!: Relation<Business>;

    @writer async markAsDeleted() {
        await this.update((r) => {
            r.deleted = true;
        });
    }
}

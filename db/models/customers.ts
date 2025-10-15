import { Model, Query, Relation } from '@nozbe/watermelondb';
import {
    children,
    date,
    field,
    text,
    writer,
    readonly,
    relation,
} from '@nozbe/watermelondb/decorators';
import Sale from './sales';
import Business from './business';

export default class Customer extends Model {
    static table = 'customers';
    static associations = {
        sales: { type: 'has_many' as const, foreignKey: 'customer_id' },
    };

    @field('external_id') externalId!: string;
    @field('business_id') businessId!: string;
    @text('name') name!: string;
    @text('phone') phone!: string;
    @text('email') email!: string;
    @field('credit_limit') creditLimit!: number;
    @field('current_balance') currentBalance!: number;
    @field('reputation_score') reputationScore!: number;
    @readonly @date('created_at') createdAt!: Date;
    @readonly @date('updated_at') updatedAt!: Date;
    @field('deleted') deleted!: boolean;

    @relation('businesses', 'business_id') business!: Relation<Business>;
    @children('sales') sales!: Query<Sale>;

    @writer async markAsDeleted() {
        await this.update((c) => {
            c.deleted = true;
        });
    }
}

import { Model, Query, Relation } from '@nozbe/watermelondb';
import {
    children,
    date,
    field,
    readonly,
    relation,
    text,
    writer,
} from '@nozbe/watermelondb/decorators';
import SaleItem from './sales_items';
import Store from './stores';
import User from './users';
import Customer from './customers';

export default class Sale extends Model {
    static table = 'sales';
    static associations = {
        sales_items: { type: 'has_many' as const, foreignKey: 'sale_id' },
    };

    @field('external_id') externalId!: string;
    @field('store_id') storeId!: string;
    @field('user_id') userId!: string;
    @field('customer_id') customerId!: string;
    @field('total_amount') totalAmount!: number;
    @field('discount_amount') discountAmount!: number;
    @field('discount_percentage') discountPercentage!: number;
    @field('subtotal') subtotal!: number;
    @text('payment_method') paymentMethod!: string;
    @field('on_credit') onCredit!: boolean;
    @field('amount_paid') amountPaid!: number;
    @field('amount_on_credit') amountOnCredit!: number;
    @text('status') status!: string;
    @readonly @date('created_at') createdAt!: Date;
    @readonly @date('updated_at') updatedAt!: Date;

    @relation('stores', 'store_id') store!: Relation<Store>;
    @relation('users', 'user_id') user!: Relation<User>;
    @relation('customers', 'customer_id') customer?: Relation<Customer>;
    @children('sales_items') items!: Query<SaleItem>;

    @writer async markAsCompleted() {
        await this.update((s) => {
            s.status = 'completed';
        });
    }
}

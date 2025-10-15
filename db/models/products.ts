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
import Business from './business';
import Category from './categories';
import Inventory from './inventory';

export default class Product extends Model {
    static table = 'products';
    static associations = {
        categories: { type: 'belongs_to' as const, key: 'category_id' },
        businesses: { type: 'belongs_to' as const, key: 'business_id' },
        inventory: { type: 'has_many' as const, foreignKey: 'product_id' },
    };

    @field('external_id') externalId!: string;
    @field('business_id') businessId!: string;
    @field('category_id') categoryId!: string;
    @text('name') name!: string;
    @field('cost') cost!: number;
    @field('barcode') barcode!: string;
    @field('description') description!: string;
    @text('unit') unit!: string;
    @text('status') status!: string;
    @readonly @date('created_at') createdAt!: Date;
    @readonly @date('updated_at') updatedAt!: Date;
    @field('deleted') deleted!: boolean;

    @relation('categories', 'category_id') category!: Relation<Category>;
    @relation('businesses', 'business_id') business!: Relation<Business>;
    @children('inventory') inventory!: Query<Inventory>;

    @writer async markAsDeleted() {
        await this.update((p) => {
            p.deleted = true;
        });
    }
}

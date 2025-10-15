import { Model, Relation } from '@nozbe/watermelondb';
import { field, relation, writer } from '@nozbe/watermelondb/decorators';
import Sale from './sales';
import Product from './products';

export default class SaleItem extends Model {
    static table = 'sales_items';
    static associations = {
        sales: { type: 'belongs_to' as const, key: 'sale_id' },
        products: { type: 'belongs_to' as const, key: 'product_id' },
    };

    @field('external_id') externalId!: string;
    @field('sale_id') saleId!: string;
    @field('product_id') productId!: string;
    @field('quantity') quantity!: number;
    @field('unit_price') unitPrice!: number;
    @field('total_price') totalPrice!: number;

    @relation('sales', 'sale_id') sale!: Relation<Sale>;
    @relation('products', 'product_id') product!: Relation<Product>;

    @writer async updateQuantity(newQty: number) {
        await this.update((it) => {
            it.quantity = newQty;
            it.totalPrice = (it.unitPrice || 0) * newQty;
        });
    }
}

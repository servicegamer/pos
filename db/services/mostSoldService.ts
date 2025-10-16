import { Q } from '@nozbe/watermelondb';
import { inventoryCollection, saleItemsCollection, salesCollection } from '..';

export interface MostSoldProduct {
    productId: string;
    productName: string;
    totalQuantitySold: number;
    totalRevenue: number;
    inventoryId: string;
    price: number;
    currentStock: number;
}

export const mostSoldService = {
    async getMostSoldProducts(storeId: string, limit: number = 10): Promise<MostSoldProduct[]> {
        try {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const sales = await salesCollection
                .query(
                    Q.where('store_id', storeId),
                    Q.where('status', 'completed'),
                    Q.where('created_at', Q.gte(thirtyDaysAgo.getTime())),
                )
                .fetch();

            if (sales.length === 0) {
                return [];
            }

            const saleIds = sales.map((sale) => sale.id);

            const saleItems = await saleItemsCollection
                .query(Q.where('sale_id', Q.oneOf(saleIds)))
                .fetch();

            const productSales: Record<
                string,
                { quantity: number; revenue: number; productName: string }
            > = {};

            for (const item of saleItems) {
                const product = await item.product.fetch();

                if (!productSales[product.id]) {
                    productSales[product.id] = {
                        quantity: 0,
                        revenue: 0,
                        productName: product.name,
                    };
                }

                productSales[product.id].quantity += item.quantity;
                productSales[product.id].revenue += item.totalPrice;
            }

            const sortedProducts = Object.entries(productSales)
                .sort(([, a], [, b]) => b.quantity - a.quantity)
                .slice(0, limit);

            const mostSold: MostSoldProduct[] = [];

            for (const [productId, data] of sortedProducts) {
                const inventoryItems = await inventoryCollection
                    .query(
                        Q.where('product_id', productId),
                        Q.where('store_id', storeId),
                        Q.where('deleted', false),
                    )
                    .fetch();

                const inventory = inventoryItems.length > 0 ? inventoryItems[0] : null;

                if (inventory) {
                    mostSold.push({
                        productId,
                        productName: data.productName,
                        totalQuantitySold: data.quantity,
                        totalRevenue: data.revenue,
                        inventoryId: inventory.id,
                        price: inventory.price,
                        currentStock: inventory.quantity || 0,
                    });
                }
            }

            return mostSold;
        } catch (error) {
            console.error('Error fetching most sold products:', error);
            return [];
        }
    },
};

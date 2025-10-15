import { Q } from '@nozbe/watermelondb';
import {
    customersCollection,
    database,
    productsCollection,
    saleItemsCollection,
    salesCollection,
} from '..';
import { inventoryService } from './inventoryService';

export const salesService = {
    async createSale(
        saleData: {
            storeId: string;
            userId: string;
            customerId?: string;
            subtotal: number;
            discountAmount?: number;
            discountPercentage?: number;
            totalAmount: number;
            paymentMethod: string;
            onCredit: boolean;
        },
        items: {
            productId: string;
            quantity: number;
            unitPrice: number;
            totalPrice: number;
        }[],
    ) {
        return await database.write(async () => {
            const sale = await salesCollection.create((s) => {
                s.externalId = `sale_${Date.now()}`;
                s.storeId = saleData.storeId;
                s.userId = saleData.userId;
                s.customerId = saleData.customerId || '';
                s.subtotal = saleData.subtotal;
                s.discountAmount = saleData.discountAmount || 0;
                s.discountPercentage = saleData.discountPercentage || 0;
                s.totalAmount = saleData.totalAmount;
                s.paymentMethod = saleData.paymentMethod;
                s.onCredit = saleData.onCredit;
                s.status = 'pending';
            });

            for (const item of items) {
                await saleItemsCollection.create((saleItem) => {
                    saleItem.externalId = `item_${Date.now()}_${Math.random()}`;
                    saleItem.saleId = sale.id;
                    saleItem.productId = item.productId;
                    saleItem.quantity = item.quantity;
                    saleItem.unitPrice = item.unitPrice;
                    saleItem.totalPrice = item.totalPrice;
                });
            }

            return sale;
        });
    },

    async completeSale(saleId: string, userId: string) {
        const sale = await salesCollection.find(saleId);
        const saleItems = await sale.items.fetch();

        return await database.write(async () => {
            for (const item of saleItems) {
                const inventory = await inventoryService.getInventoryByProduct(
                    item.productId,
                    sale.storeId,
                );

                if (inventory) {
                    await inventoryService.adjustInventoryWithBatch(inventory.id, -item.quantity, {
                        userId,
                        batchType: 'sale',
                        referenceId: saleId,
                        notes: `Sale completed - ${item.quantity} units sold`,
                    });
                }
            }

            await sale.markAsCompleted();

            if (sale.onCredit && sale.customerId) {
                const customer = await customersCollection.find(sale.customerId);

                await customer.update((c: any) => {
                    c.currentBalance = (c.currentBalance || 0) + sale.totalAmount;
                });
            }

            return sale;
        });
    },

    async getSaleById(saleId: string) {
        return await salesCollection.find(saleId);
    },

    async getSalesByStore(storeId: string, limit: number = 100) {
        return await salesCollection
            .query(Q.where('store_id', storeId), Q.sortBy('created_at', Q.desc), Q.take(limit))
            .fetch();
    },

    async getSalesByDateRange(storeId: string, startDate: Date, endDate: Date) {
        return await salesCollection
            .query(
                Q.where('store_id', storeId),
                Q.where('created_at', Q.between(startDate.getTime(), endDate.getTime())),
                Q.sortBy('created_at', Q.desc),
            )
            .fetch();
    },

    async getSalesByCustomer(customerId: string) {
        return await salesCollection
            .query(Q.where('customer_id', customerId), Q.sortBy('created_at', Q.desc))
            .fetch();
    },

    async getCreditSales(storeId: string) {
        return await salesCollection
            .query(
                Q.where('store_id', storeId),
                Q.where('on_credit', true),
                Q.sortBy('created_at', Q.desc),
            )
            .fetch();
    },

    async getSaleWithItems(saleId: string) {
        const sale = await salesCollection.find(saleId);
        const items = await sale.items.fetch();

        const itemsWithProducts = await Promise.all(
            items.map(async (item) => {
                const product = await productsCollection.find(item.productId);
                return { item, product };
            }),
        );

        return { sale, items: itemsWithProducts };
    },

    async getTodaySales(storeId: string) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return await this.getSalesByDateRange(storeId, today, tomorrow);
    },

    async getSalesStats(storeId: string, startDate: Date, endDate: Date) {
        const sales = await this.getSalesByDateRange(storeId, startDate, endDate);

        const stats = sales.reduce(
            (acc, sale) => {
                acc.totalSales += 1;
                acc.totalRevenue += sale.totalAmount;
                acc.totalDiscount += sale.discountAmount || 0;
                if (sale.onCredit) {
                    acc.creditSales += 1;
                    acc.creditAmount += sale.totalAmount;
                }
                if (sale.status === 'completed') {
                    acc.completedSales += 1;
                }
                return acc;
            },
            {
                totalSales: 0,
                completedSales: 0,
                totalRevenue: 0,
                totalDiscount: 0,
                creditSales: 0,
                creditAmount: 0,
            },
        );

        return stats;
    },
};

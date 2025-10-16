import { useBusiness } from '@/contexts/BusinessContext';
import { categoriesCollection, inventoryCollection } from '@/db';
import Category from '@/db/models/categories';
import Inventory from '@/db/models/inventory';
import { Q } from '@nozbe/watermelondb';
import { useEffect, useState } from 'react';

export interface CheckoutCategoryItem {
    id: string;
    externalId: string;
    name: string;
    icon: string;
    color: string;
    productCount: number;
}

export interface CheckoutInventoryItem {
    id: string;
    productId: string;
    productName: string;
    categoryId: string;
    categoryName: string;
    price: number;
    quantity: number;
    unit: string;
    barcode: string;
    minStock: number;
    maxStock: number;
    location: string;
}

export const useCheckoutData = () => {
    const { selectedBusiness, selectedStore } = useBusiness();
    const [categories, setCategories] = useState<CheckoutCategoryItem[]>([]);
    const [inventory, setInventory] = useState<CheckoutInventoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!selectedBusiness || !selectedStore) {
            setLoading(false);
            return;
        }

        const categorySub = categoriesCollection
            .query(Q.where('business_id', selectedBusiness.id), Q.where('deleted', false))
            .observe()
            .subscribe(async (cats: Category[]) => {
                try {
                    const categoryItems = await Promise.all(
                        cats.map(async (cat) => {
                            const products = await cat.products.fetch();
                            const activeProducts = products.filter((p) => !p.deleted);

                            return {
                                id: cat.id,
                                externalId: cat.externalId,
                                name: cat.name,
                                icon: cat.icon,
                                color: cat.color,
                                productCount: activeProducts.length,
                            };
                        }),
                    );

                    setCategories(categoryItems);
                } catch (error) {
                    console.error('Error processing categories:', error);
                }
            });

        const inventorySub = inventoryCollection
            .query(Q.where('store_id', selectedStore.id), Q.where('deleted', false))
            .observeWithColumns(['quantity', 'price', 'min_stock', 'max_stock', 'location'])
            .subscribe(async (invData: Inventory[]) => {
                try {
                    const inventoryItems = await Promise.all(
                        invData.map(async (inv) => {
                            const product = await inv.product.fetch();
                            const category = await product.category.fetch();

                            return {
                                id: inv.id,
                                productId: product.id,
                                productName: product.name,
                                categoryId: category.id,
                                categoryName: category.name,
                                price: inv.price || 0,
                                quantity: inv.quantity || 0,
                                unit: product.unit || 'pcs',
                                barcode: product.barcode || '',
                                minStock: inv.minStock || 0,
                                maxStock: inv.maxStock || 100,
                                location: inv.location || '',
                            };
                        }),
                    );

                    setInventory(inventoryItems);
                    setLoading(false);
                } catch (error) {
                    console.error('Error processing inventory:', error);
                    setLoading(false);
                }
            });

        return () => {
            categorySub.unsubscribe();
            inventorySub.unsubscribe();
        };
    }, [selectedBusiness, selectedStore]);

    return {
        categories,
        inventory,
        loading,
    };
};

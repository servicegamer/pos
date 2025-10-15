import { useBusiness } from '@/contexts/BusinessContext';
import { inventoryCollection } from '@/db';
import { categoryService } from '@/db/services/categoryService';
import { CategoryItem, InventoryViewItem } from '@/types';
import { Q } from '@nozbe/watermelondb';
import { useEffect, useMemo, useState } from 'react';

export function useInventoryData(): {
    inventory: InventoryViewItem[];
    categories: CategoryItem[];
    rawCategories: CategoryItem[];
    loading: boolean;
    refreshinvetoryData: () => Promise<void>;
} {
    const { selectedStore, selectedBusiness } = useBusiness();
    const [inventory, setInventory] = useState<InventoryViewItem[]>([]);
    const [rawCategories, setRawCategories] = useState<CategoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Subscribe to inventory changes
    useEffect(() => {
        if (!selectedStore) {
            setLoading(false);
            return;
        }

        const subscription = inventoryCollection
            .query(Q.where('store_id', selectedStore.id))
            .observeWithColumns(['quantity', 'price', 'min_stock', 'max_stock', 'location'])
            .subscribe(async (invData) => {
                try {
                    const inventoryWithDetails = await Promise.all(
                        invData.map(async (inv: any) => {
                            const product = await inv.product.fetch();
                            const category = await product.category.fetch();

                            const viewItem: InventoryViewItem = {
                                id: inv.id,
                                productId: product.id,
                                name: product.name,
                                category: category.name,
                                categoryId: category.id,
                                categoryIcon: category.icon,
                                categoryColor: category.color,
                                quantity: inv.quantity || 0,
                                minStock: inv.minStock || 0,
                                maxStock: inv.maxStock || 100,
                                price: inv.price || 0,
                                cost: inv.weightedAvgCost || product.cost || 0,
                                unit: product.unit || 'pcs',
                                barcode: product.barcode || '',
                                location: inv.location || '',
                                lastUpdated: inv.lastUpdated || new Date(),
                            };

                            return viewItem;
                        }),
                    );

                    setInventory(inventoryWithDetails);
                    setLoading(false);
                } catch (error) {
                    console.error('Error processing inventory data:', error);
                    setLoading(false);
                }
            });

        return () => subscription.unsubscribe();
    }, [selectedStore]);

    // Subscribe to category changes
    useEffect(() => {
        if (!selectedBusiness) {
            // clear categories if no business selected
            setRawCategories([]);
            return;
        }
        const businessId = selectedBusiness.id;
        // Capture the id to ensure it's non-null within async callbacks

        if (!businessId) {
            return;
        }

        let cancelled = false;
        let subscription: any | undefined;

        async function startSubscription() {
            try {
                subscription = await categoryService.observeCategoriesByBusiness(
                    businessId,
                    (catData: any[]) => {
                        if (cancelled) return;
                        const mapped: CategoryItem[] = catData.map((cat: any) => ({
                            id: cat.id,
                            name: cat.name,
                            icon: cat.icon,
                            color: cat.color,
                            count: 0,
                        }));

                        setRawCategories(mapped);
                    },
                );
            } catch (err) {
                // handle or log error if observe fails
                console.error('Failed to observe categories:', err);
            }
        }

        startSubscription();

        return () => {
            cancelled = true;
            if (subscription?.unsubscribe) {
                subscription.unsubscribe();
            }
        };
    }, [selectedBusiness, selectedBusiness?.id]);

    // Calculate categories with counts based on current inventory
    const categories = useMemo(() => {
        const categoriesWithCounts: CategoryItem[] = rawCategories.map((cat) => ({
            ...cat,
            count: inventory.filter((item) => item.categoryId === cat.id).length,
        }));

        const allCategory: CategoryItem = {
            id: 'all',
            name: 'All',
            icon: '📋',
            color: 'bg-gray-600',
            count: inventory.length,
        };

        return [allCategory, ...categoriesWithCounts];
    }, [rawCategories, inventory]);

    const refreshinvetoryData = async () => {
        if (!selectedStore) {
            return;
        }

        setLoading(true);
        
        try {
            const invData = await inventoryCollection
                .query(Q.where('store_id', selectedStore.id))
                .fetch();

            const inventoryWithDetails = await Promise.all(
                invData.map(async (inv: any) => {
                    const product = await inv.product.fetch();
                    const category = await product.category.fetch();

                    const viewItem: InventoryViewItem = {
                        id: inv.id,
                        productId: product.id,
                        name: product.name,
                        category: category.name,
                        categoryId: category.id,
                        categoryIcon: category.icon,
                        categoryColor: category.color,
                        quantity: inv.quantity || 0,
                        minStock: inv.minStock || 0,
                        maxStock: inv.maxStock || 100,
                        price: inv.price || 0,
                        cost: inv.weightedAvgCost || product.cost || 0,
                        unit: product.unit || 'pcs',
                        barcode: product.barcode || '',
                        location: inv.location || '',
                        lastUpdated: inv.lastUpdated || new Date(),
                    };

                    return viewItem;
                }),
            );

            setInventory(inventoryWithDetails);
        } catch (error) {
            console.error('Error refreshing inventory data:', error);
        } finally {
            setLoading(false);
        }
    };

    return {
        inventory,
        categories,
        rawCategories,
        loading,
        refreshinvetoryData,
    };
}

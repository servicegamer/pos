// import { AddProductModal } from '@/components/inventory/AddProductModal';

import { CategoriesGrid } from '@/components/inventory/category/CategoriesGrid';
import { InventoryHeader } from '@/components/inventory/InventoryHeader';
import { InventoryList } from '@/components/inventory/InventoryItemsList';
import { ProductModal } from '@/components/inventory/modal/productModal';
import { SearchAndFilterRow } from '@/components/inventory/SearchAndFilterRow';
import { useAuth } from '@/contexts/AuthContext';
import { useBusiness } from '@/contexts/BusinessContext';
import { categoryService } from '@/db/services/categoryService';
import { inventoryService } from '@/db/services/inventoryService';
import { productService } from '@/db/services/productService';
import { useInventoryData } from '@/hooks/useInventoryData';
import { useInventoryFilters } from '@/hooks/useInventoryFilters';
import { CategoryData, InventoryItemData, Product, ProductData } from '@/types';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Keyboard, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const InventoryTab = () => {
    const { user } = useAuth();
    const [showAddModal, setShowAddModal] = useState(false);
    const { inventory, categories, rawCategories, loading, refreshinvetoryData } =
        useInventoryData();
    const { selectedBusiness, selectedStore } = useBusiness();

    const {
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        selectedFilter,
        toggleFilter,
        isSearchFocused,
        setIsSearchFocused,
        filteredData,
        getFilterText,
    } = useInventoryFilters(inventory);

    const handleCategoryPress = (category: any) => {
        setSelectedCategory(category.name);
        if (category.name !== 'All') {
            router.push({
                pathname: '/inventory/category',
                params: {
                    categoryId: category.id,
                    categoryName: category.name,
                },
            });
        }
    };

    const handleShowModal = () => {
        setShowAddModal(true);
    };
    const handleAddProduct = async (
        newPoduct: ProductData,
        newInventoryProductData: InventoryItemData,
    ) => {
        if (!selectedBusiness || !selectedStore || !user) {
            Alert.alert('Error', 'Missing business or store information');
            return;
        }

        const product = await productService.createProduct({
            businessId: selectedBusiness.id,
            categoryId: newPoduct.categoryId,
            name: newPoduct.name,
            cost: parseFloat(newPoduct.cost) || 0,
            barcode: newPoduct.barcode,
            description: newPoduct.description,
            unit: newPoduct.unit || 'pcs',
            status: 'active',
        });

        const inventory = await inventoryService.createInventory({
            productId: product.id,
            storeId: selectedStore.id,
            quantity: newInventoryProductData.quantity || 0,
            minStock: newInventoryProductData.minStock || 0,
            maxStock: newInventoryProductData.maxStock || 100,
            price: newInventoryProductData.price,
            wholeSalePrice: newInventoryProductData.wholeSalePrice || 0,
            weightedAvgCost: parseFloat(newPoduct.cost) || 0,
            lastPurchasePrice: parseFloat(newPoduct.cost) || 0,
            location: newInventoryProductData.location,
        });

        if (newInventoryProductData.quantity > 0) {
            await inventoryService.adjustInventoryWithBatch(
                inventory.id,
                parseFloat(newInventoryProductData.quantity.toString()),
                {
                    userId: user.id,
                    costPerUnit: parseFloat(newPoduct.cost) || 0,
                    batchType: 'purchase',
                    notes: 'Initial stock',
                },
            );
        }
    };

    const handleProductAdded = () => {
        refreshinvetoryData();
    };

    const handleCreateCategory = async (newCategoryData: CategoryData) => {
        if (!newCategoryData.name.trim()) {
            Alert.alert('Error', 'Category name is required');
            return;
        }

        if (!selectedBusiness) {
            Alert.alert('Error', 'No business selected');
            return;
        }
        const newCategory = await categoryService.createCategory({
            businessId: selectedBusiness.id,
            name: newCategoryData.name,
            icon: newCategoryData.icon,
            color: newCategoryData.color,
        });

        console.log('Create new category');
        refreshinvetoryData();
        return newCategory;
    };

    const handleSaveItem = (updatedItem: Product) => {
        console.log('Save item:', updatedItem);
        refreshinvetoryData();
    };

    const handleDeleteItem = (itemId: string) => {
        console.log('Delete item:', itemId);
        refreshinvetoryData();
    };

    const dismissSearch = () => {
        setIsSearchFocused(false);
        Keyboard.dismiss();
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        dismissSearch();
    };

    return (
        <SafeAreaView className='flex-1 bg-gray-50'>
            <View className='bg-white px-4 py-3'>
                <InventoryHeader onShowModal={handleShowModal} />

                <SearchAndFilterRow
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    isSearchFocused={isSearchFocused}
                    onSearchFocus={() => setIsSearchFocused(true)}
                    onSearchBlur={() => setIsSearchFocused(false)}
                    onClear={handleClearSearch}
                    selectedFilter={selectedFilter}
                    onToggleFilter={toggleFilter}
                />

                <CategoriesGrid
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onCategoryPress={handleCategoryPress}
                />
            </View>

            <InventoryList
                data={filteredData}
                filterText={getFilterText()}
                onSave={handleSaveItem}
                onDelete={handleDeleteItem}
                availableCategories={categories}
            />

            <ProductModal
                visible={showAddModal}
                onClose={() => setShowAddModal(false)}
                onProductAdded={handleProductAdded}
                categories={rawCategories}
                loadingCategories={loading}
                refreshCategories={refreshinvetoryData}
                addCategory={handleCreateCategory}
                addProduct={handleAddProduct}
            />
        </SafeAreaView>
    );
};

export default InventoryTab;

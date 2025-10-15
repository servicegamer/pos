import { CartSummaryBar } from '@/components/checkout/CartSummaryBar';
import { ProductList } from '@/components/checkout/ProductList';
import { CategoryHeader } from '@/components/common/CategoryHeader';
import { SearchBar } from '@/components/common/SearchBar';
import { CATEGORIES } from '@/constants/categories';
import { useCart } from '@/hooks/useCart';
import { useProducts } from '@/hooks/useProducts';
import { useSearch } from '@/hooks/useSearch';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

const CategoryScreen: React.FC = () => {
    // Get category info from route params
    const { categoryId, categoryName } = useLocalSearchParams();

    // Find the full category object from constants
    const category = CATEGORIES.find((cat) => cat.id === categoryId);

    // Get cart from global state
    const { globalCart, updateGlobalCart } = useCart();

    const { searchQuery, setSearchQuery, isSearchFocused, handleSearchFocus, handleSearchBlur } =
        useSearch();

    const { addToCart, removeFromCart, filteredProducts, cartTotals, getCartItems } = useProducts(
        category?.name || '',
        globalCart,
        updateGlobalCart,
    );

    const filtered = filteredProducts(searchQuery);
    const { totalItems, totalPrice } = cartTotals;

    const handleCheckout = () => {
        // Format cart items
        const formattedCartItems = getCartItems().map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.inCart || 0,
        }));

        // Update global cart
        updateGlobalCart(formattedCartItems);

        // Navigate to payment screen
        router.push('/(tabs)/checkout/payment');
    };

    // Handle case where category is not found
    if (!category) {
        return (
            <SafeAreaView className='flex-1 bg-gray-50'>
                <CategoryHeader
                    category={{ id: '', name: 'Unknown', color: '#000', icon: '', count: 0 }}
                    productCount={0}
                    onBack={() => router.back()}>
                    <SearchBar
                        placeholder='Search...'
                        value=''
                        onChangeText={() => {}}
                        isSearchFocused={false}
                        onFocus={() => {}}
                        onBlur={() => {}}
                    />
                </CategoryHeader>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className='flex-1 bg-gray-50'>
            <CategoryHeader
                category={category}
                productCount={filtered.length}
                onBack={() => router.back()}>
                <SearchBar
                    placeholder={`Search ${category.name.toLowerCase()}...`}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    isSearchFocused={isSearchFocused}
                    onFocus={handleSearchFocus}
                    onBlur={handleSearchBlur}
                />
            </CategoryHeader>

            <ProductList
                products={filtered}
                category={category}
                searchQuery={searchQuery}
                onAddToCart={addToCart}
                onRemoveFromCart={removeFromCart}
            />

            {totalItems > 0 && (
                <CartSummaryBar
                    totalItems={totalItems}
                    totalPrice={totalPrice}
                    onCheckout={handleCheckout}
                />
            )}
        </SafeAreaView>
    );
};

export default CategoryScreen;

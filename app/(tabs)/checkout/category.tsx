import { CartSummaryBar } from '@/components/checkout/CartSummaryBar';
import { ProductList } from '@/components/checkout/ProductList';
import { CategoryHeader } from '@/components/common/CategoryHeader';
import { SearchBar } from '@/components/common/SearchBar';
import { useCart } from '@/contexts/CartContext';
import { useCheckoutData } from '@/hooks/useCheckoutData';
import { useSearch } from '@/hooks/useSearch';
import { Product } from '@/types';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

const CategoryScreen: React.FC = () => {
    const { categoryId, categoryName } = useLocalSearchParams();

    const { cart, totalItems, totalPrice, addToCart, updateQuantity } = useCart();
    const { categories, inventory } = useCheckoutData();

    const { searchQuery, setSearchQuery, isSearchFocused, handleSearchFocus, handleSearchBlur } =
        useSearch();

    const category = categories.find((cat) => cat.id === categoryId);

    const categoryProducts: Product[] = useMemo(() => {
        return inventory
            .filter((inv) => inv.categoryId === categoryId)
            .map((inv) => {
                const cartItem = cart.find((item) => item.id === inv.id);
                return {
                    id: inv.id,
                    name: inv.productName,
                    category: inv.categoryName,
                    price: inv.price,
                    stock: inv.quantity,
                    unit: inv.unit,
                    code: inv.barcode,
                    inCart: cartItem ? cartItem.quantity : 0,
                };
            });
    }, [inventory, categoryId, cart]);

    const filteredProducts = useMemo(() => {
        return categoryProducts.filter(
            (product) =>
                product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (product.code && product.code.toLowerCase().includes(searchQuery.toLowerCase())),
        );
    }, [categoryProducts, searchQuery]);

    const handleAddToCart = (product: Product) => {
        addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
        });
    };

    const handleRemoveFromCart = (product: Product) => {
        const cartItem = cart.find((item) => item.id === product.id);
        if (cartItem) {
            updateQuantity(product.id, cartItem.quantity - 1);
        }
    };

    const handleCheckout = () => {
        if (totalItems > 0) {
            router.push('/(tabs)/checkout/payment');
        }
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
                productCount={filteredProducts.length}
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
                products={filteredProducts}
                category={
                    category || { id: '', name: 'Unknown', color: '#000', icon: '', count: 0 }
                }
                searchQuery={searchQuery}
                onAddToCart={handleAddToCart}
                onRemoveFromCart={handleRemoveFromCart}
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

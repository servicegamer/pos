import { CartSummaryBar } from '@/components/checkout/CartSummaryBar';
import { CategoriesGrid } from '@/components/checkout/CategoriesGrid';
import { QuickReferenceSection } from '@/components/checkout/QuickReferenceSection';
import { Header } from '@/components/common/Header';
import { SearchBar } from '@/components/common/SearchBar';
import { useCart } from '@/contexts/CartContext';
import { useCheckoutData } from '@/hooks/useCheckoutData';
import { router } from 'expo-router';
import React from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface CategoryPressItem {
    id: string;
    name: string;
}

const ShopPOS: React.FC = () => {
    const [isSearchFocused, setIsSearchFocused] = React.useState(false);
    const [searchText, setSearchText] = React.useState('');

    const { cart, totalItems, totalPrice } = useCart();
    const { categories, loading } = useCheckoutData();

    const handleCategoryPress = (category: CategoryPressItem) => {
        // Navigate to category screen with params
        router.push({
            pathname: '/(tabs)/checkout/category',
            params: {
                categoryId: category.id,
                categoryName: category.name,
            },
        });
    };

    const handleMainCartCheckout = () => {
        if (totalItems > 0) {
            router.push('/(tabs)/checkout/payment');
        }
    };

    if (loading) {
        return (
            <SafeAreaView className='flex-1 bg-white'>
                <Header title='Shop POS'>
                    <SearchBar
                        placeholder='Search products...'
                        isSearchFocused={isSearchFocused}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setIsSearchFocused(false)}
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                </Header>
                <View className='flex-1 items-center justify-center'>
                    <ActivityIndicator size='large' color='#000' />
                    <Text className='mt-2 text-gray-600'>Loading categories...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className='flex-1 bg-white'>
            <Header title='Shop POS'>
                <SearchBar
                    placeholder='Search products...'
                    isSearchFocused={isSearchFocused}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    value={searchText}
                    onChangeText={setSearchText}
                />
            </Header>

            <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
                <CategoriesGrid categories={categories} onCategoryPress={handleCategoryPress} />

                <QuickReferenceSection />
            </ScrollView>

            <CartSummaryBar
                totalItems={totalItems}
                totalPrice={totalPrice}
                onCheckout={handleMainCartCheckout}
            />
        </SafeAreaView>
    );
};

export default ShopPOS;

import { CartSummaryBar } from '@/components/checkout/CartSummaryBar';
import { CategoriesGrid } from '@/components/checkout/CategoriesGrid';
import { QuickReferenceSection } from '@/components/checkout/QuickReferenceSection';
import { Header } from '@/components/common/Header';
import { SearchBar } from '@/components/common/SearchBar';
import { CATEGORIES } from '@/constants/categories';
import { QUICK_ITEMS } from '@/constants/quickItems';
import { useCart } from '@/hooks/useCart';
import { Category } from '@/types';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ShopPOS: React.FC = () => {
    const [isSearchFocused, setIsSearchFocused] = React.useState(false);
    const [searchText, setSearchText] = React.useState('');

    const { globalCart, totalCartItems, totalCartPrice, updateGlobalCart } = useCart();

    const handleCategoryPress = (category: Category) => {
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
        if (totalCartItems > 0) {
            // Navigate to payment screen
            router.push('/(tabs)/checkout/payment');
        }
    };

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
                <CategoriesGrid categories={CATEGORIES} onCategoryPress={handleCategoryPress} />

                <QuickReferenceSection
                    quickItems={QUICK_ITEMS}
                    globalCart={globalCart}
                    setGlobalCart={updateGlobalCart}
                />
            </ScrollView>

            <CartSummaryBar
                totalItems={totalCartItems}
                totalPrice={totalCartPrice}
                onCheckout={handleMainCartCheckout}
            />
        </SafeAreaView>
    );
};

export default ShopPOS;

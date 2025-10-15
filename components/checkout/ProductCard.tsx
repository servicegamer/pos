import { Category, Product } from '@/types';
import { Minus, Plus } from 'lucide-react-native';
import React, { useRef } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';

interface ProductCardProps {
    category: Category;
    product: Product;
    onAddToCart: (product: Product) => void;
    onRemoveFromCart: (product: Product) => void;
}
// Helper function to get appropriate stock unit based on category
const getStockUnit = (categoryName: string): string => {
    switch (categoryName) {
        case 'Beverages':
            return 'bottles';
        case 'Snacks':
            return 'packs';
        case 'Dairy':
            return 'items';
        case 'Bakery':
            return 'loaves';
        case 'Fruits':
        case 'Vegetables':
            return 'kg';
        case 'Meat':
            return 'kg';
        case 'Frozen':
            return 'items';
        case 'Household':
        case 'Personal Care':
            return 'items';
        default:
            return 'items';
    }
};

const ProductCard: React.FC<ProductCardProps> = ({
    category,
    product,
    onAddToCart,
    onRemoveFromCart,
}) => {
    const scaleValue = useRef(new Animated.Value(1)).current;

    const handlePressIn = (): void => {
        Animated.spring(scaleValue, {
            toValue: 0.98,
            useNativeDriver: true,
            tension: 400,
            friction: 10,
        }).start();
    };

    const handlePressOut = (): void => {
        Animated.spring(scaleValue, {
            toValue: 1,
            useNativeDriver: true,
            tension: 400,
            friction: 10,
        }).start();
    };

    const inCart = product.inCart || 0;

    return (
        <TouchableOpacity
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={0.95}
            className='mb-3'>
            <Animated.View
                className='bg-white rounded-xl p-4'
                style={{
                    transform: [{ scale: scaleValue }],
                    shadowColor: '#000',
                    shadowOffset: {
                        width: 0,
                        height: 2,
                    },
                    shadowOpacity: 0.06,
                    shadowRadius: 6,
                    elevation: 3,
                }}>
                <View className='flex-row justify-between items-start mb-2'>
                    <View className='flex-1'>
                        <Text className='text-lg font-semibold text-gray-900 mb-1'>
                            {product.name}
                        </Text>
                        <Text className='text-sm text-gray-600 mb-1'>{product.brand}</Text>
                        <Text className='text-lg font-bold text-gray-900 mb-1'>
                            ${product.price.toFixed(2)}
                        </Text>
                        <Text className='text-sm text-gray-500 mb-2'>{product.size}</Text>
                    </View>

                    <View className='items-end'>
                        <Text className='text-sm text-gray-500 mb-2'>
                            Stock: {product.stock} {getStockUnit(category.name)}
                        </Text>
                        {inCart > 0 && (
                            <View className='bg-red-500 rounded-full px-2 py-1 mb-2'>
                                <Text className='text-white text-xs font-medium'>
                                    {inCart} in cart
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                <Text className='text-sm text-gray-600 mb-4'>{product.description}</Text>

                {inCart > 0 ? (
                    <View className='flex-row items-center justify-between'>
                        <View className='flex-row items-center bg-gray-100 rounded-full'>
                            <TouchableOpacity
                                onPress={() => onRemoveFromCart(product)}
                                className='p-2'>
                                <Minus size={16} color='#374151' />
                            </TouchableOpacity>
                            <Text className='mx-4 font-semibold text-gray-900'>{inCart}</Text>
                            <TouchableOpacity onPress={() => onAddToCart(product)} className='p-2'>
                                <Plus size={16} color='#374151' />
                            </TouchableOpacity>
                        </View>
                        <Text className='text-lg font-bold text-gray-900'>
                            ${(product.price * inCart).toFixed(2)}
                        </Text>
                    </View>
                ) : (
                    <TouchableOpacity
                        onPress={() => onAddToCart(product)}
                        className='bg-gray-900 rounded-xl py-3 flex-row items-center justify-center'>
                        <Plus size={16} color='#FFFFFF' />
                        <Text className='text-white font-semibold ml-2'>Add to Cart</Text>
                    </TouchableOpacity>
                )}
            </Animated.View>
        </TouchableOpacity>
    );
};

export default ProductCard;

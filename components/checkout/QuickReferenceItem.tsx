import { useCart } from '@/contexts/CartContext';
import { Minus, Plus } from 'lucide-react-native';
import React, { useRef } from 'react';
import { Animated, Text, TouchableOpacity } from 'react-native';
import { AddButton } from '../ui/ActionButton';
import { QuantityControls } from '../common/QuantityControls';

interface QuickItem {
    id: string;
    name: string;
    price: string;
}

interface QuickReferenceItemProps {
    item: QuickItem;
}

export const QuickReferenceItem: React.FC<QuickReferenceItemProps> = ({ item }) => {
    const scaleValue = useRef(new Animated.Value(1)).current;
    const { cart, addToCart, updateQuantity } = useCart();

    const cartItem = cart.find((cartItem) => cartItem.id === item.id);
    const currentQuantity = cartItem ? cartItem.quantity : 0;

    const handleAddToCart = () => {
        const priceValue = parseFloat(item.price.replace('$', ''));
        addToCart({
            id: item.id,
            name: item.name,
            price: priceValue,
            quantity: 1,
        });
    };

    const handleIncrease = () => {
        if (cartItem) {
            updateQuantity(item.id, cartItem.quantity + 1);
        }
    };

    const handleDecrease = () => {
        if (cartItem) {
            updateQuantity(item.id, cartItem.quantity - 1);
        }
    };

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

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.95}
      className="mb-2"
    >
      <Animated.View
        className="flex-row items-center justify-between py-3 px-4 bg-white rounded-lg"
        style={{
          transform: [{ scale: scaleValue }],
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <Text className="text-gray-800 font-medium flex-1">
          {item.name}
        </Text>
        <Text className="text-gray-600 font-medium mr-3">
          {item.price}
        </Text>

        {currentQuantity > 0 ? (
            <QuantityControls
                quantity={currentQuantity}
                onIncrease={handleIncrease}
                onDecrease={handleDecrease}
                size='sm'
                variant='primary'
            />
        ) : (
            <AddButton onPress={handleAddToCart} size='sm' />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};
import { CartItem, QuickItem } from '@/types';
import React, { useRef } from 'react';
import {
  Animated,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useQuickItem } from '@/hooks/useQuickItem';
import { Plus } from 'lucide-react-native';
import { AddButton } from '../ui/ActionButton';
import { QuantityControls } from '../common/QuantityControls';

interface QuickReferenceItemProps {
  item: QuickItem;
  globalCart: CartItem[];
  setGlobalCart: (cart: CartItem[]) => void;
}

export const QuickReferenceItem: React.FC<QuickReferenceItemProps> = ({
  item,
  globalCart,
  setGlobalCart
}) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const {
    currentQuantity,
    addToCart,
    removeFromCart
  } = useQuickItem(item, globalCart, setGlobalCart);

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

        {/* Even simpler with convenience wrapper */}
        {currentQuantity > 0 ? (
          <QuantityControls
            quantity={currentQuantity}
            onIncrease={addToCart}
            onDecrease={removeFromCart}
            size="sm"
            variant="primary"
          />
        ) : (
          <AddButton
            onPress={addToCart}
            size="sm"
          />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};
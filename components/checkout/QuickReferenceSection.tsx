import { CartItem, QuickItem } from '@/types';
import React from 'react';
import { View } from 'react-native';
import { SectionTitle } from '../common/SectionTitle';
import { QuickReferenceItem } from './QuickReferenceItem';


interface QuickReferenceSectionProps {
  quickItems: QuickItem[];
  globalCart: CartItem[];
  setGlobalCart: (cart: CartItem[]) => void;
}

export const QuickReferenceSection: React.FC<QuickReferenceSectionProps> = ({
  quickItems,
  globalCart,
  setGlobalCart
}) => {
  return (
    <View className="px-4 mt-6 mb-6">
      <SectionTitle title="Quick Reference" />
      {quickItems.map((item: QuickItem, index: number) => (
        <QuickReferenceItem 
          key={index} 
          item={item} 
          globalCart={globalCart} 
          setGlobalCart={setGlobalCart}
        />
      ))}
    </View>
  );
};
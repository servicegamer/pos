import { CartItem } from '@/types';
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export interface CartContextValue {
    cart: CartItem[];
    totalItems: number;
    totalPrice: number;
    addToCart: (item: CartItem) => void;
    removeFromCart: (itemId: string) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    clearCart: () => void;
    setCart: (items: CartItem[]) => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [cart, setCartState] = useState<CartItem[]>([]);

    const totalItems = useMemo(() => {
        return cart.reduce((sum, item) => sum + item.quantity, 0);
    }, [cart]);

    const totalPrice = useMemo(() => {
        return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }, [cart]);

    const addToCart = useCallback((item: CartItem) => {
        setCartState((prevCart) => {
            const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
            if (existingItem) {
                return prevCart.map((cartItem) =>
                    cartItem.id === item.id
                        ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
                        : cartItem,
                );
            }
            return [...prevCart, item];
        });
    }, []);

    const removeFromCart = useCallback((itemId: string) => {
        setCartState((prevCart) => prevCart.filter((item) => item.id !== itemId));
    }, []);

    const updateQuantity = useCallback((itemId: string, quantity: number) => {
        if (quantity <= 0) {
            setCartState((prevCart) => prevCart.filter((item) => item.id !== itemId));
            return;
        }

        setCartState((prevCart) =>
            prevCart.map((item) => (item.id === itemId ? { ...item, quantity } : item)),
        );
    }, []);

    const clearCart = useCallback(() => {
        setCartState([]);
    }, []);

    const setCart = useCallback((items: CartItem[]) => {
        setCartState(items);
    }, []);

    const value = useMemo(
        () => ({
            cart,
            totalItems,
            totalPrice,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            setCart,
        }),
        [cart, totalItems, totalPrice, addToCart, removeFromCart, updateQuantity, clearCart, setCart],
    );

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextValue => {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within CartProvider');
    return ctx;
};

export default CartContext;

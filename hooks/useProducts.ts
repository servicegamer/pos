import { useState, useCallback, useMemo } from 'react';
import { Product, CartItem } from '@/types';
import { SAMPLE_PRODUCTS } from '@/constants/sampleProducts';

export const useProducts = (
	categoryName: string,
	existingCart: CartItem[] = [],
	onCartUpdate?: (cartItems: CartItem[]) => void,
) => {
	// Initialize products with existing cart quantities
	const initializeProductsWithCart = useCallback(
		(products: Product[], cart: CartItem[]): Product[] => {
			return products.map((product) => {
				const cartItem = cart.find((item) => item.id === product.id);
				return {
					...product,
					inCart: cartItem ? cartItem.quantity : 0,
				};
			});
		},
		[],
	);

	const categoryProducts = useMemo(
		() => SAMPLE_PRODUCTS.filter((product) => product.category === categoryName),
		[categoryName],
	);

	const [productList, setProductList] = useState<Product[]>(() =>
		initializeProductsWithCart(categoryProducts, existingCart),
	);

	const updateProductQuantity = useCallback(
		(productId: string, newQuantity: number) => {
			setProductList((prev) => {
				const updatedProducts = prev.map((product) =>
					product.id === productId
						? { ...product, inCart: Math.max(0, newQuantity) }
						: product,
				);

				// Update global cart when local cart changes
				if (onCartUpdate) {
					const cartItems = updatedProducts
						.filter((p) => (p.inCart || 0) > 0)
						.map((p) => ({
							id: p.id,
							name: p.name,
							price: p.price,
							quantity: p.inCart || 0,
						}));
					onCartUpdate(cartItems);
				}

				return updatedProducts;
			});
		},
		[onCartUpdate],
	);

	const addToCart = useCallback(
		(product: Product) => {
			updateProductQuantity(product.id, (product.inCart || 0) + 1);
		},
		[updateProductQuantity],
	);

	const removeFromCart = useCallback(
		(product: Product) => {
			updateProductQuantity(product.id, (product.inCart || 0) - 1);
		},
		[updateProductQuantity],
	);

	const filteredProducts = useMemo(
		() => (searchQuery: string) =>
			productList.filter(
				(product) =>
					product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
					product.brand?.toLowerCase().includes(searchQuery.toLowerCase()),
			),
		[productList],
	);

	const cartTotals = useMemo(() => {
		const totalItems = productList.reduce((sum, product) => sum + (product.inCart || 0), 0);
		const totalPrice = productList.reduce(
			(sum, product) => sum + product.price * (product.inCart || 0),
			0,
		);
		return { totalItems, totalPrice };
	}, [productList]);

	const getCartItems = useCallback(
		() => productList.filter((p) => (p.inCart || 0) > 0),
		[productList],
	);

	return {
		productList,
		addToCart,
		removeFromCart,
		filteredProducts,
		cartTotals,
		getCartItems,
	};
};

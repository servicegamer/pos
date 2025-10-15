import { Category } from '@/db';
import { CategoryData, CategoryItem, InventoryViewItem } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FormInput from '../FormInput';

interface EditProductModalProps {
    visible: boolean;
    onClose: () => void;
    onProductUpdated?: () => void;
    item: InventoryViewItem | null;
    categories: CategoryItem[];
    addCategory: (newCategoryData: CategoryData) => Promise<Category | undefined>;
    loadingCategories: boolean;
    refreshCategories: () => Promise<void>;
    updateProduct: (
        productId: string,
        updates: Partial<{
            name: string;
            categoryId: string;
            cost: number;
            barcode: string;
            description: string;
            unit: string;
            status: string;
        }>,
    ) => Promise<void>;
    updateInventory: (
        inventoryId: string,
        updates: {
            price?: number;
            wholeSalePrice?: number;
            minStock?: number;
            maxStock?: number;
            location?: string;
        },
    ) => Promise<void>;
}

interface FormData {
    name: string;
    categoryId: string;
    cost: string;
    price: string;
    wholeSalePrice: string;
    barcode: string;
    description: string;
    unit: string;
    minStock: string;
    maxStock: string;
    location: string;
}

export const EditProductModal: React.FC<EditProductModalProps> = ({
    visible,
    onClose,
    addCategory,
    loadingCategories,
    refreshCategories,
    onProductUpdated,
    updateProduct,
    updateInventory,
    categories,
    item,
}) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState<boolean>(false);
    const [showCreateCategory, setShowCreateCategory] = useState<boolean>(false);
    const [newCategoryData, setNewCategoryData] = useState<CategoryData>({
        name: '',
        icon: '📦',
        color: '#6B7280',
    });

    const [formData, setFormData] = useState<FormData>({
        name: '',
        categoryId: '',
        cost: '',
        price: '',
        wholeSalePrice: '',
        barcode: '',
        description: '',
        unit: '',
        minStock: '',
        maxStock: '',
        location: '',
    });

    useEffect(() => {
        if (item && visible) {
            setFormData({
                name: item.name || '',
                categoryId: item.categoryId || '',
                cost: item.cost?.toString() || '',
                price: item.price?.toString() || '',
                wholeSalePrice: '',
                barcode: item.barcode || '',
                description: '',
                unit: item.unit || 'pcs',
                minStock: item.minStock?.toString() || '',
                maxStock: item.maxStock?.toString() || '',
                location: item.location || '',
            });
        }
    }, [item, visible]);

    const handleCreateCategory = async (): Promise<void> => {
        try {
            const newCategory = await addCategory(newCategoryData);
            await refreshCategories();
            if (!newCategory) {
                Alert.alert('Error', 'No category created');
                return;
            }

            setFormData((prev) => ({ ...prev, categoryId: newCategory.id }));
            setShowCreateCategory(false);
            setShowCategoryDropdown(false);
            setNewCategoryData({ name: '', icon: '📦', color: '#6B7280' });
            Alert.alert('Success', 'Category created successfully!');
        } catch (error) {
            console.error('Error creating category:', error);
            Alert.alert('Error', 'Failed to create category');
        }
    };

    const showCreateCategoryForm = (): void => {
        if (categories.length > 0 && !formData.categoryId) {
            setFormData((prev) => ({ ...prev, categoryId: categories[0].id }));
        }
        refreshCategories();
        setShowCategoryDropdown(!showCategoryDropdown);
    };

    const handleSubmit = async (): Promise<void> => {
        if (!item) {
            Alert.alert('Error', 'No item selected');
            return;
        }

        if (!formData.name.trim()) {
            Alert.alert('Error', 'Product name is required');
            return;
        }

        if (!formData.categoryId) {
            Alert.alert('Error', 'Please select a category');
            return;
        }

        if (!formData.price || parseFloat(formData.price) <= 0) {
            Alert.alert('Error', 'Please enter a valid price');
            return;
        }

        setLoading(true);

        try {
            const productUpdates: Partial<{
                name: string;
                categoryId: string;
                cost: number;
                barcode: string;
                description: string;
                unit: string;
                status: string;
            }> = {
                name: formData.name,
                categoryId: formData.categoryId,
                barcode: formData.barcode,
                description: formData.description,
                unit: formData.unit || 'pcs',
            };

            if (formData.cost) {
                productUpdates.cost = parseFloat(formData.cost);
            }

            await updateProduct(item.productId, productUpdates);

            const parsedMinStock = parseFloat(formData.minStock);
            const parsedMaxStock = parseFloat(formData.maxStock);
            const parsedWholeSalePrice = parseFloat(formData.wholeSalePrice);

            const inventoryUpdates: {
                price?: number;
                wholeSalePrice?: number;
                minStock?: number;
                maxStock?: number;
                location?: string;
            } = {
                price: parseFloat(formData.price),
                minStock: Number.isFinite(parsedMinStock) ? parsedMinStock : 0,
                maxStock: Number.isFinite(parsedMaxStock) ? parsedMaxStock : 100,
                location: formData.location,
            };

            if (formData.wholeSalePrice !== '' && Number.isFinite(parsedWholeSalePrice)) {
                inventoryUpdates.wholeSalePrice = parsedWholeSalePrice;
            }

            await updateInventory(item.id, inventoryUpdates);

            Alert.alert('Success', 'Product updated successfully!');
            onProductUpdated?.();
            onClose();
        } catch (error) {
            console.error('Error updating product:', error);
            Alert.alert('Error', 'Failed to update product');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = (): void => {
        onClose();
    };

    const selectedCategory = categories.find((cat) => cat.id === formData.categoryId);

    return (
        <Modal
            visible={visible}
            animationType='slide'
            presentationStyle='pageSheet'
            onRequestClose={handleClose}>
            <SafeAreaView className='flex-1 bg-white'>
                <View className='flex-row justify-between items-center px-4 py-4 border-b border-gray-200'>
                    <Text className='text-xl font-bold text-black'>Edit Product</Text>
                    <TouchableOpacity onPress={handleClose}>
                        <Ionicons name='close' size={24} color='#666' />
                    </TouchableOpacity>
                </View>

                <ScrollView className='flex-1 px-4 py-6' showsVerticalScrollIndicator={false}>
                    <Text className='text-gray-600 text-center mb-6'>
                        Update product details and inventory information.
                    </Text>

                    <View className='mb-4'>
                        <FormInput
                            label='Product Name'
                            required={true}
                            value={formData.name}
                            onChangeText={(text: string) =>
                                setFormData((prev) => ({ ...prev, name: text }))
                            }
                            placeholder='Enter product name'
                        />
                    </View>

                    <View className='mb-4'>
                        <Text className='text-sm font-medium text-gray-700 mb-1'>
                            Category <Text className='text-red-500'>*</Text>
                        </Text>
                        <TouchableOpacity
                            className='bg-gray-100 rounded-lg text-gray-700 text-base rounded-lg px-3 py-3 flex-row justify-between items-center'
                            onPress={showCreateCategoryForm}>
                            <Text className={selectedCategory ? 'text-gray-900' : 'text-gray-400'}>
                                {selectedCategory
                                    ? `${selectedCategory.icon} ${selectedCategory.name}`
                                    : 'Select category'}
                            </Text>
                            <Ionicons
                                name={showCategoryDropdown ? 'chevron-up' : 'chevron-down'}
                                size={20}
                                color='#666'
                            />
                        </TouchableOpacity>

                        {showCategoryDropdown && (
                            <View className='border border-gray-300 rounded-lg mt-2 overflow-hidden'>
                                <ScrollView style={{ maxHeight: 200 }}>
                                    {categories.map((cat) => (
                                        <TouchableOpacity
                                            key={cat.id}
                                            className={`px-3 py-3 border-b border-gray-200 ${
                                                formData.categoryId === cat.id ? 'bg-blue-50' : ''
                                            }`}
                                            onPress={() => {
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    categoryId: cat.id,
                                                }));
                                                setShowCategoryDropdown(false);
                                            }}>
                                            <Text
                                                className={
                                                    formData.categoryId === cat.id
                                                        ? 'text-blue-600 font-medium'
                                                        : 'text-gray-900'
                                                }>
                                                {cat.icon} {cat.name}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                    <TouchableOpacity
                                        className='px-3 py-3 bg-gray-50 border-t border-gray-300'
                                        onPress={() => {
                                            setShowCreateCategory(true);
                                            setShowCategoryDropdown(false);
                                        }}>
                                        <Text className='text-blue-600 font-medium'>
                                            <Ionicons name='add-circle' size={16} color='#2563EB' />{' '}
                                            Create New Category
                                        </Text>
                                    </TouchableOpacity>
                                </ScrollView>
                            </View>
                        )}

                        {showCreateCategory && (
                            <View className='border border-gray-300 rounded-lg mt-2 p-3 bg-gray-50'>
                                <View className='flex-row justify-between items-center mb-3'>
                                    <Text className='font-semibold text-gray-900'>
                                        Create New Category
                                    </Text>
                                    <TouchableOpacity onPress={() => setShowCreateCategory(false)}>
                                        <Ionicons name='close' size={20} color='#666' />
                                    </TouchableOpacity>
                                </View>

                                <View className='mb-3'>
                                    <Text className='text-sm font-medium text-gray-700 mb-1'>
                                        Name *
                                    </Text>
                                    <TextInput
                                        className='border border-gray-300 rounded-lg px-3 py-2 bg-white'
                                        value={newCategoryData.name}
                                        onChangeText={(text: string) =>
                                            setNewCategoryData((prev) => ({ ...prev, name: text }))
                                        }
                                        placeholder='Enter category name'
                                    />
                                </View>

                                <View className='flex-row gap-3 mb-3'>
                                    <View className='flex-1'>
                                        <Text className='text-sm font-medium text-gray-700 mb-1'>
                                            Icon
                                        </Text>
                                        <TextInput
                                            className='border border-gray-300 rounded-lg px-3 py-2 bg-white'
                                            value={newCategoryData.icon}
                                            onChangeText={(text: string) =>
                                                setNewCategoryData((prev) => ({
                                                    ...prev,
                                                    icon: text,
                                                }))
                                            }
                                            placeholder='📦'
                                        />
                                    </View>
                                    <View className='flex-1'>
                                        <Text className='text-sm font-medium text-gray-700 mb-1'>
                                            Color
                                        </Text>
                                        <TextInput
                                            className='border border-gray-300 rounded-lg px-3 py-2 bg-white'
                                            value={newCategoryData.color}
                                            onChangeText={(text: string) =>
                                                setNewCategoryData((prev) => ({
                                                    ...prev,
                                                    color: text,
                                                }))
                                            }
                                            placeholder='#6B7280'
                                        />
                                    </View>
                                </View>

                                <View className='flex-row gap-2'>
                                    <TouchableOpacity
                                        className='flex-1 bg-gray-200 rounded-lg py-2'
                                        onPress={() => {
                                            setShowCreateCategory(false);
                                            setNewCategoryData({
                                                name: '',
                                                icon: '📦',
                                                color: '#6B7280',
                                            });
                                        }}>
                                        <Text className='text-center font-medium text-gray-700'>
                                            Cancel
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        className={`flex-1 rounded-lg py-2 ${
                                            newCategoryData.name.trim()
                                                ? 'bg-blue-600'
                                                : 'bg-gray-300'
                                        }`}
                                        onPress={handleCreateCategory}
                                        disabled={!newCategoryData.name.trim()}>
                                        <Text
                                            className={`text-center font-medium ${
                                                newCategoryData.name.trim()
                                                    ? 'text-white'
                                                    : 'text-gray-500'
                                            }`}>
                                            Create
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </View>

                    <View className='flex-row mb-4 gap-3'>
                        <View className='flex-1'>
                            <FormInput
                                label='Cost Price'
                                placeholder='0.00'
                                keyboardType='decimal-pad'
                                value={formData.cost}
                                onChangeText={(text: string) =>
                                    setFormData((prev) => ({ ...prev, cost: text }))
                                }
                            />
                        </View>
                        <View className='flex-1'>
                            <FormInput
                                label='Wholesale Price'
                                placeholder='0.00'
                                keyboardType='decimal-pad'
                                value={formData.wholeSalePrice}
                                onChangeText={(text: string) =>
                                    setFormData((prev) => ({ ...prev, wholeSalePrice: text }))
                                }
                            />
                        </View>
                        <View className='flex-1'>
                            <FormInput
                                label='Retail Price'
                                required={true}
                                placeholder='0.00'
                                keyboardType='decimal-pad'
                                value={formData.price}
                                onChangeText={(text: string) =>
                                    setFormData((prev) => ({ ...prev, price: text }))
                                }
                            />
                        </View>
                    </View>

                    <View className='flex-row mb-4 gap-3'>
                        <View className='flex-1'>
                            <FormInput
                                label='Barcode/SKU'
                                placeholder='Enter barcode or SKU'
                                value={formData.barcode}
                                onChangeText={(text: string) =>
                                    setFormData((prev) => ({ ...prev, barcode: text }))
                                }
                            />
                        </View>

                        <View className='flex-1'>
                            <FormInput
                                label='Unit'
                                value={formData.unit}
                                onChangeText={(text: string) =>
                                    setFormData((prev) => ({ ...prev, unit: text }))
                                }
                                placeholder='pcs, kg, liter, etc.'
                            />
                        </View>
                    </View>

                    <View className='flex-row mb-4 gap-3'>
                        <View className='flex-1'>
                            <FormInput
                                label='Min Stock Alert'
                                value={formData.minStock}
                                onChangeText={(text: string) =>
                                    setFormData((prev) => ({ ...prev, minStock: text }))
                                }
                                placeholder='0'
                                keyboardType='numeric'
                            />
                        </View>
                        <View className='flex-1'>
                            <FormInput
                                label='Max Stock Alert'
                                value={formData.maxStock}
                                onChangeText={(text: string) =>
                                    setFormData((prev) => ({ ...prev, maxStock: text }))
                                }
                                placeholder='100'
                                keyboardType='numeric'
                            />
                        </View>
                    </View>

                    <View className='mb-4'>
                        <FormInput
                            label='Location'
                            value={formData.location}
                            onChangeText={(text: string) =>
                                setFormData((prev) => ({ ...prev, location: text }))
                            }
                            placeholder='Shelf, Aisle, etc.'
                        />
                    </View>

                    <View className='mb-8'>
                        <FormInput
                            label='Description (optional)'
                            value={formData.description}
                            onChangeText={(text: string) =>
                                setFormData((prev) => ({ ...prev, description: text }))
                            }
                            placeholder='Product description (optional)'
                            multiline
                            numberOfLines={3}
                            textAlignVertical='top'
                        />
                    </View>
                </ScrollView>

                <View className='flex-row px-4 py-4 space-x-3 border-t border-gray-200'>
                    <TouchableOpacity
                        className='flex-1 bg-gray-200 rounded-xl py-4 mx-2'
                        onPress={handleClose}
                        disabled={loading}>
                        <Text className='text-center font-semibold text-gray-700'>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className={`flex-1 rounded-xl py-4 mx-2 ${
                            formData.name && formData.categoryId && formData.price
                                ? 'bg-black'
                                : 'bg-gray-300'
                        }`}
                        onPress={handleSubmit}
                        disabled={
                            loading ||
                            !formData.name ||
                            !formData.categoryId ||
                            !formData.price
                        }>
                        {loading ? (
                            <ActivityIndicator color='white' />
                        ) : (
                            <Text
                                className={`text-center font-semibold ${
                                    formData.name && formData.categoryId && formData.price
                                        ? 'text-white'
                                        : 'text-gray-500'
                                }`}>
                                Update Product
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </Modal>
    );
};

import { Category } from '@/db';
import { CategoryData, CategoryItem, InventoryItemData, ProductData } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
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

interface AddProductModalProps {
    visible: boolean;
    onClose: () => void;
    onProductAdded?: () => void;
    categories: CategoryItem[];
    addCategory: (newCategoryData: CategoryData) => Promise<Category | undefined>;
    loadingCategories: boolean;
    refreshCategories: () => Promise<void>;
    addProduct: (
        newPoduct: ProductData,
        newInventoryProductData: InventoryItemData,
    ) => Promise<void>;
}

export const ProductModal: React.FC<AddProductModalProps> = ({
    visible,
    onClose,
    addCategory,
    loadingCategories,
    refreshCategories,
    onProductAdded,
    addProduct,
    categories,
}) => {
    const [loading, setLoading] = useState(false);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [showCreateCategory, setShowCreateCategory] = useState(false);
    const [newCategoryData, setNewCategoryData] = useState({
        name: '',
        icon: '📦',
        color: '#6B7280',
    });

    const [formData, setFormData] = useState({
        name: '',
        categoryId: '',
        cost: '',
        price: '',
        wholeSalePrice: '',
        barcode: '',
        description: '',
        unit: '',
        quantity: '',
        quantityPerUnit: '',
        minStock: '',
        maxStock: '',
        location: '',
    });

    const handleCreateCategory = async () => {
        try {
            const newCategory = await addCategory(newCategoryData);
            await refreshCategories();
            if (!newCategory) {
                Alert.alert('Error', 'no category created');
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

    const showCreateCategoryForm = () => {
        console.log('Show categories', categories);

        if (categories.length > 0 && !formData.categoryId) {
            setFormData((prev) => ({ ...prev, categoryId: categories[0].id }));
        }
        refreshCategories();
        setShowCategoryDropdown(!showCategoryDropdown);
    };

    const handleSubmit = async () => {
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
            const newPoduct: ProductData = {
                name: formData.name,
                categoryId: formData.categoryId,
                cost: formData.cost,
                barcode: formData.barcode,
                description: formData.description,
                unit: formData.unit || 'pcs',
                minStock: parseFloat(formData.minStock) || 0,
                maxStock: parseFloat(formData.maxStock) || 100,
                price: parseFloat(formData.price),
                location: formData.location,
                initialQuantity: parseFloat(formData.quantity) || 0,
            };

            const newInventoryProductData: InventoryItemData = {
                quantity: parseFloat(formData.quantity) || 0,
                price: parseFloat(formData.price),
                minStock: parseFloat(formData.minStock) || 0,
                maxStock: parseFloat(formData.maxStock) || 100,
                wholeSalePrice: 0,
                weightedAvgCost: parseFloat(formData.cost) || 0,
                lastPurchasePrice: parseFloat(formData.cost) || 0,
                location: formData.location,
            };
            await addProduct(newPoduct, newInventoryProductData);

            Alert.alert('Success', 'Product added successfully!');
            resetForm();
            onProductAdded?.();
            onClose();
        } catch (error) {
            console.error('Error creating product:', error);
            Alert.alert('Error', 'Failed to create product');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            categoryId: categories.length > 0 ? categories[0].id : '',
            cost: '',
            price: '',
            wholeSalePrice: '',
            barcode: '',
            description: '',
            unit: 'pcs',
            quantity: '',
            quantityPerUnit: '',
            minStock: '',
            maxStock: '',
            location: '',
        });
    };

    const handleClose = () => {
        resetForm();
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
                    <Text className='text-xl font-bold text-black'>Add New Product</Text>
                    <TouchableOpacity onPress={handleClose}>
                        <Ionicons name='close' size={24} color='#666' />
                    </TouchableOpacity>
                </View>

                <ScrollView className='flex-1 px-4 py-6' showsVerticalScrollIndicator={false}>
                    <Text className='text-gray-600 text-center mb-6'>
                        Create a new product in your inventory with all necessary details.
                    </Text>

                    <View className='mb-4'>
                        <FormInput
                            label='Product Name'
                            required={true}
                            value={formData.name}
                            onChangeText={(text) =>
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
                            className='bg-gray-100 rounded-lg  text-gray-700 text-baserounded-lg px-3 py-3 flex-row justify-between items-center'
                            // onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}>
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
                                        onChangeText={(text) =>
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
                                            onChangeText={(text) =>
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
                                            onChangeText={(text) =>
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
                                onChangeText={(text) =>
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
                                onChangeText={(text) =>
                                    setFormData((prev) => ({ ...prev, wholeSalePrice: text }))
                                }
                            />
                        </View>
                        <View className='flex-1'>
                            <FormInput
                                label='retail Price'
                                required={true}
                                placeholder='0.00'
                                keyboardType='decimal-pad'
                                value={formData.price}
                                onChangeText={(text) =>
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
                                onChangeText={(text) =>
                                    setFormData((prev) => ({ ...prev, barcode: text }))
                                }
                            />
                        </View>

                        <View className='flex-1'>
                            <FormInput
                                label='Unit'
                                value={formData.unit}
                                onChangeText={(text) =>
                                    setFormData((prev) => ({ ...prev, unit: text }))
                                }
                                placeholder='pcs, kg, liter, etc.'
                            />
                        </View>
                    </View>

                    <View className='flex-row mb-4 gap-3'>
                        <View className='flex-1'>
                            <FormInput
                                label='Quatity per Unit'
                                value={formData.quantityPerUnit}
                                onChangeText={(text) =>
                                    setFormData((prev) => ({ ...prev, quantityPerUnit: text }))
                                }
                                placeholder='eg 500ml, 6pcs, 1 dozen etc.'
                            />
                        </View>
                        <View className='flex-1'>
                            <FormInput
                                label='Inventory Quantity'
                                value={formData.quantity}
                                onChangeText={(text) =>
                                    setFormData((prev) => ({ ...prev, quantity: text }))
                                }
                                placeholder='0'
                                keyboardType='numeric'
                            />
                        </View>
                    </View>
                    <View className='flex-row mb-4 gap-3'>
                        <View className='flex-1'>
                            <FormInput
                                label='Min Stock alert'
                                value={formData.minStock}
                                onChangeText={(text) =>
                                    setFormData((prev) => ({ ...prev, minStock: text }))
                                }
                                placeholder='0'
                                keyboardType='numeric'
                            />
                        </View>
                        <View className='flex-1'>
                            <FormInput
                                label='Max Stock alert'
                                value={formData.maxStock}
                                onChangeText={(text) =>
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
                            onChangeText={(text) =>
                                setFormData((prev) => ({ ...prev, location: text }))
                            }
                            placeholder='Shelf, Aisle, etc.'
                        />
                    </View>

                    <View className='mb-8'>
                        <FormInput
                            label='Description (optional)'
                            value={formData.description}
                            onChangeText={(text) =>
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
                        className={`flex-1 rounded-xl py-4 ${
                            formData.name && formData.categoryId && formData.price
                                ? 'bg-black'
                                : 'bg-gray-300'
                        }`}
                        onPress={handleSubmit}
                        disabled={
                            !formData.name || !formData.categoryId || !formData.price || loading
                        }>
                        {loading ? (
                            <ActivityIndicator size='small' color='#FFFFFF' />
                        ) : (
                            <Text
                                className={`text-center font-semibold ${
                                    formData.name && formData.categoryId && formData.price
                                        ? 'text-white'
                                        : 'text-gray-500'
                                }`}>
                                Add Product
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </Modal>
    );
};

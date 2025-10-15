import { ActionButton } from '@/components/ui/ActionButton';
import { Customer } from '@/types';
import { X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface AddCustomerModalProps {
    visible: boolean;
    onClose: () => void;
    onAddCustomer: (customer: Customer) => void;
}

export const AddCustomerModal: React.FC<AddCustomerModalProps> = ({
    visible,
    onClose,
    onAddCustomer,
}) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const resetForm = () => {
        setFirstName('');
        setLastName('');
        setPhoneNumber('');
        setIsSubmitting(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = async () => {
        if (!firstName.trim() || !lastName.trim() || !phoneNumber.trim()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const newCustomer: Customer = {
                id: `customer-${Date.now()}`,
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                phoneNumber: phoneNumber.trim(),
                amount: 0,
                dueDate: '',
                rating: 'Low',
                daysLeft: 0,
            };

            onAddCustomer(newCustomer);
            resetForm();
            onClose();
        } catch (error) {
            console.error('Error adding customer:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFormValid = firstName.trim() && lastName.trim() && phoneNumber.trim();

    return (
        <Modal visible={visible} transparent animationType='fade' onRequestClose={handleClose}>
            <View className='flex-1 bg-black/50 justify-center items-center p-4'>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className='w-full max-w-sm'>
                    <View className='bg-white rounded-2xl p-6 w-full'>
                        {/* Header */}
                        <View className='flex-row items-center justify-between mb-6'>
                            <Text className='text-lg font-semibold text-gray-900'>
                                Add New Customer
                            </Text>
                            <TouchableOpacity
                                onPress={handleClose}
                                className='p-1'
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                <X size={20} color='#6B7280' />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* First Name */}
                            <View className='mb-4'>
                                <Text className='text-sm font-medium text-gray-900 mb-2'>
                                    First Name
                                </Text>
                                <TextInput
                                    value={firstName}
                                    onChangeText={setFirstName}
                                    placeholder='Enter first name'
                                    placeholderTextColor='#9CA3AF'
                                    className='bg-gray-50 rounded-lg px-3 py-3 text-gray-900 border border-gray-200'
                                    autoCapitalize='words'
                                    returnKeyType='next'
                                />
                            </View>

                            {/* Last Name */}
                            <View className='mb-4'>
                                <Text className='text-sm font-medium text-gray-900 mb-2'>
                                    Last Name
                                </Text>
                                <TextInput
                                    value={lastName}
                                    onChangeText={setLastName}
                                    placeholder='Enter last name'
                                    placeholderTextColor='#9CA3AF'
                                    className='bg-gray-50 rounded-lg px-3 py-3 text-gray-900 border border-gray-200'
                                    autoCapitalize='words'
                                    returnKeyType='next'
                                />
                            </View>

                            {/* Phone Number */}
                            <View className='mb-6'>
                                <Text className='text-sm font-medium text-gray-900 mb-2'>
                                    Phone Number
                                </Text>
                                <TextInput
                                    value={phoneNumber}
                                    onChangeText={setPhoneNumber}
                                    placeholder='Enter phone number'
                                    placeholderTextColor='#9CA3AF'
                                    className='bg-gray-50 rounded-lg px-3 py-3 text-gray-900 border border-gray-200'
                                    keyboardType='phone-pad'
                                    returnKeyType='done'
                                    onSubmitEditing={handleSubmit}
                                />
                            </View>

                            {/* Buttons */}
                            <View className='flex-row space-x-3'>
                                <ActionButton
                                    text='Cancel'
                                    onPress={handleClose}
                                    variant='ghost'
                                    size='md'
                                    fullWidth
                                    className='flex-1'
                                />
                                <ActionButton
                                    text='Confirm New Customer'
                                    onPress={handleSubmit}
                                    variant='primary'
                                    size='md'
                                    fullWidth
                                    className='flex-1'
                                    disabled={!isFormValid}
                                    loading={isSubmitting}
                                />
                            </View>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

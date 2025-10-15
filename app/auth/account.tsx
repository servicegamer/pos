import { AuthButton } from '@/components/auth/AuthButton';
import { FormInput } from '@/components/auth/FormInput';
// import { logout } from '@/models/db/services/userService';
// import Session from '@/models/db/sessions';
// import User from '@/db/models/users';
import { UserData } from '@/types';
import { Ionicons } from '@expo/vector-icons';

import StoreSwitcher from '@/components/StoreSwitcher';
import { Session, User } from '@/db';
import { logout } from '@/db/services/userService';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AccountScreenProps {
    activeSession: Session | null;
    user: User | null;
    isAuthenticated: boolean;
}

const AccountScreenComponent = ({ activeSession, user, isAuthenticated }: AccountScreenProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState('');
    const [editedEmail, setEditedEmail] = useState('');
    const [editedPhone, setEditedPhone] = useState('');
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    useEffect(() => {
        console.log('🔄 Component re-rendered with:', {
            activeSession: activeSession?.id,
            user: user?.id,
            isAuthenticated,
        });
    }, [activeSession, user, isAuthenticated]);

    const handleCreateAccount = useCallback(() => {
        router.push('/auth/signup');
    }, [router]);

    const handleLogout = useCallback(async () => {
        console.log('🚪 Logging out...');
        await logout();
    }, []);

    const handleEdit = useCallback(() => {
        if (user) {
            setEditedName(user.name || '');
            setEditedEmail(user.email || '');
            setEditedPhone(user.phone || '');
            setIsEditing(true);
        }
    }, [user]);

    const handleSave = useCallback(async () => {
        if (!user) return;

        setSaving(true);
        try {
            console.log('💾 Saving user data...');
            const updateData: Partial<UserData> = {
                name: editedName || user.name,
                email: editedEmail || user.email,
                phone: editedPhone || user.phone,
                externalId: user.externalId,
                isOwner: user.isOwner,
            };

            // Persist user using WatermelonDB model instance directly
            await user.updateUserInfo(updateData);

            setIsEditing(false);
            console.log('✅ User data saved successfully');
        } catch (error) {
            console.error('❌ Error updating user:', error);
        } finally {
            setSaving(false);
        }
    }, [user, editedName, editedEmail, editedPhone]);

    const handleCancel = useCallback(() => {
        setIsEditing(false);
    }, []);

    return (
        <SafeAreaView className='flex-1 bg-gray-50'>
            {!isAuthenticated ? (
                <View className='flex-1 justify-center items-center px-4'>
                    <View className='bg-white rounded-2xl p-6 shadow-md w-full max-w-md'>
                        <Text className='text-xl font-semibold text-center mb-4'>Welcome Back</Text>
                        <Text className='text-gray-500 text-center mb-6'>
                            Please sign in to access your account
                        </Text>
                        <AuthButton
                            title='Sign In'
                            onPress={handleCreateAccount}
                            variant='primary'
                        />
                    </View>
                </View>
            ) : (
                <View className='flex-1 p-4'>
                    <View className='bg-white rounded-2xl p-6 shadow-md mb-4'>
                        <View className='flex-row justify-between items-center mb-6'>
                            <Text className='text-xl font-semibold'>Profile</Text>
                            {!isEditing && (
                                <TouchableOpacity
                                    onPress={handleEdit}
                                    className='flex-row items-center'>
                                    <Ionicons name='pencil' size={20} color='#4B5563' />
                                    <Text className='ml-2 text-gray-600'>Edit</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {isEditing ? (
                            <View>
                                <FormInput
                                    label='Name'
                                    placeholder='Enter your name'
                                    value={editedName}
                                    onChangeText={setEditedName}
                                />
                                <FormInput
                                    label='Email'
                                    placeholder='Enter your email'
                                    value={editedEmail}
                                    onChangeText={setEditedEmail}
                                    keyboardType='email-address'
                                    autoCapitalize='none'
                                />
                                <FormInput
                                    label='Phone'
                                    placeholder='Enter your phone number'
                                    value={editedPhone}
                                    onChangeText={setEditedPhone}
                                    keyboardType='phone-pad'
                                />
                                <View className='flex-row justify-end space-x-4 mt-4'>
                                    <AuthButton
                                        title='Cancel'
                                        onPress={handleCancel}
                                        variant='secondary'
                                    />
                                    <AuthButton
                                        title={saving ? 'Saving...' : 'Save'}
                                        onPress={handleSave}
                                        disabled={saving}
                                    />
                                </View>
                            </View>
                        ) : (
                            <View className='space-y-4'>
                                <View>
                                    <Text className='text-gray-500 text-sm mb-1'>Name</Text>
                                    <Text className='text-gray-900 font-medium'>
                                        {user?.name || 'Not set'}
                                    </Text>
                                </View>
                                <View>
                                    <Text className='text-gray-500 text-sm mb-1'>Email</Text>
                                    <Text className='text-gray-900 font-medium'>
                                        {user?.email || 'Not set'}
                                    </Text>
                                </View>
                                <View>
                                    <Text className='text-gray-500 text-sm mb-1'>Phone</Text>
                                    <Text className='text-gray-900 font-medium'>
                                        {user?.phone || 'Not set'}
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>
                    {/* Store switcher - lets the user change the active store for the selected business */}
                    <View className='bg-white rounded-2xl p-6 shadow-md mb-4'>
                        <StoreSwitcher />
                    </View>

                    <View className='bg-white rounded-2xl p-6 shadow-md mb-4'>
                        <Text className='text-lg font-semibold mb-2'>Session Status</Text>
                        <View className='flex-row items-center'>
                            <View
                                className={`w-3 h-3 rounded-full mr-2 ${
                                    activeSession?.isActive ? 'bg-green-500' : 'bg-red-500'
                                }`}
                            />
                            <Text className='text-gray-600'>
                                {activeSession?.isActive ? 'Active Session' : 'Inactive'}
                            </Text>
                        </View>
                        {activeSession && (
                            <Text className='text-xs text-gray-400 mt-1'>
                                Session ID: {activeSession.id}
                            </Text>
                        )}
                    </View>

                    <AuthButton title='Logout' onPress={handleLogout} variant='secondary' />
                </View>
            )}
        </SafeAreaView>
    );
};
export default AccountScreenComponent;

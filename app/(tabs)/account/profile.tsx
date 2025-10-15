import React, { useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { UserProfileData } from '@/types/';

import { useProfileEdit } from '@/hooks/useProfileEdit';
import { BasicInfoCard } from '@/components/account/profile/BasicInfoCard';
import { ProfileHeader } from '@/components/account/profile/ProfileHeader';
import { ContactInfoCard } from '@/components/account/profile/ContactInfoCard';
import { WorkInfoCard } from '@/components/account/profile/WorkInfoCard';
import { EditModeActions } from '@/components/account/profile/EditModeActions';
import { userData } from '@/constants/account';

const MyProfileScreen: React.FC = () => {
    const params = useLocalSearchParams();
    const externalId = params?.externalId as string;

    const {
        isEditing,
        editedData,
        setIsEditing,
        handleEdit,
        handleCancel,
        handleSaveChanges,
        updateField,
    } = useProfileEdit(userData, externalId);

    // Check if we should start in edit mode
    useEffect(() => {
        if (params?.edit === 'true') {
            setIsEditing(true);
        }
    }, [params?.edit, setIsEditing]);

    // TODO: Fetch user data when externalId changes
    useEffect(() => {
        if (externalId) {
            console.log('TODO: Fetch user data for externalId:', externalId);
            // const user = await fetchUserByExternalId(externalId);
            // Update userData state
        }
    }, [externalId]);

    const handleBack = () => {
        router.back();
    };

    return (
        <SafeAreaView className='flex-1 bg-gray-50'>
            <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
                <ProfileHeader isEditing={isEditing} onBack={handleBack} onEdit={handleEdit} />

                <View className='p-4'>
                    <BasicInfoCard
                        firstName={editedData.firstName}
                        lastName={editedData.lastName}
                        role={editedData.role}
                        isEditing={isEditing}
                        onFirstNameChange={(text) => updateField('firstName', text)}
                        onLastNameChange={(text) => updateField('lastName', text)}
                        onRoleChange={(text) => updateField('role', text)}
                    />

                    <ContactInfoCard
                        phone={editedData.phone}
                        email={editedData.email}
                        emergencyContact={editedData.emergencyContact}
                        isEditing={isEditing}
                        onPhoneChange={(text) => updateField('phone', text)}
                        onEmailChange={(text) => updateField('email', text)}
                        onEmergencyContactChange={(text) => updateField('emergencyContact', text)}
                    />

                    <WorkInfoCard
                        joinDate={editedData.joinDate}
                        permissions={editedData.permissions}
                    />

                    {isEditing && (
                        <EditModeActions onSave={handleSaveChanges} onCancel={handleCancel} />
                    )}

                    {/* Extra padding for bottom nav */}
                    <View className='h-20' />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default MyProfileScreen;

import { EditModeActions } from '@/components/account/profile/EditModeActions';
import { BasicStoreInfoCard } from '@/components/account/store/BasicStoreInfoCard';
import { BusinessDetailsCard } from '@/components/account/store/BusinessDetailsCard';
import { StoreContactCard } from '@/components/account/store/StoreContactCard';
import { StoreHeader } from '@/components/account/store/StoreHeader';
import { initialStoreData } from '@/constants/account';
import { useStoreEdit } from '@/hooks/useStoreEdit';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const StoreInformationScreen: React.FC = () => {
    const params = useLocalSearchParams();
    const externalId = params?.externalId as string;

    const {
        isEditing,
        editedData,
        storeData,
        setIsEditing,
        handleEdit,
        handleCancel,
        handleSaveChanges,
        updateField,
    } = useStoreEdit(initialStoreData, externalId);

    // Check if we should start in edit mode
    useEffect(() => {
        if (params?.edit === 'true') {
            setIsEditing(true);
        }
    }, [params?.edit, setIsEditing]);

    // TODO: Fetch store data when externalId changes
    useEffect(() => {
        if (externalId) {
            console.log('TODO: Fetch store data for externalId:', externalId);
            // const store = await fetchStoreById(externalId);
            // Update storeData state
        }
    }, [externalId]);

    const handleBack = () => {
        router.back();
    };

    return (
        <SafeAreaView className='flex-1 bg-gray-50'>
            <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
                <StoreHeader isEditing={isEditing} onBack={handleBack} onEdit={handleEdit} />

                <View className='p-4'>
                    <BasicStoreInfoCard
                        name={editedData.name}
                        type={editedData.type}
                        isEditing={isEditing}
                        onNameChange={(text) => updateField('name', text)}
                        onTypeChange={(text) => updateField('type', text)}
                    />

                    <StoreContactCard
                        phone={editedData.phone}
                        email={editedData.email}
                        address={editedData.address}
                        isEditing={isEditing}
                        onPhoneChange={(text) => updateField('phone', text)}
                        onEmailChange={(text) => updateField('email', text)}
                        onAddressChange={(text) => updateField('address', text)}
                    />

                    <BusinessDetailsCard
                        description={editedData.description}
                        weekdayHours={editedData.weekdayHours}
                        weekendHours={editedData.weekendHours}
                        taxId={storeData.taxId!}
                        established={storeData.establishedYear!}
                        isEditing={isEditing}
                        onDescriptionChange={(text) => updateField('description', text)}
                        onWeekdayHoursChange={(text) => updateField('weekdayHours', text)}
                        onWeekendHoursChange={(text) => updateField('weekendHours', text)}
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

export default StoreInformationScreen;

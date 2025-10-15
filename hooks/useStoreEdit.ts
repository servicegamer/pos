import { StoreData } from '@/types';
import { useCallback, useEffect, useState } from 'react';

interface EditableStoreData {
    name: string;
    type: string;
    phone: string;
    email: string;
    address: string;
    description: string;
    weekdayHours: string;
    weekendHours: string;
}

export const useStoreEdit = (initialData: StoreData, externalId?: string) => {
    const [isEditing, setIsEditing] = useState(false);
    const [storeData, setStoreData] = useState<StoreData>(initialData);
    const [editedData, setEditedData] = useState<EditableStoreData>({
        name: initialData.name,
        type: initialData.type,
        phone: initialData.phone,
        email: initialData.email,
        address: initialData.address,
        description: initialData.description,
        weekdayHours: initialData.businessHours?.weekdays ?? '',
        weekendHours: initialData.businessHours?.weekend ?? '',
    });

    // Reset edited data when initial data changes
    useEffect(() => {
        setStoreData(initialData);
        setEditedData({
            name: initialData.name,
            type: initialData.type,
            phone: initialData.phone,
            email: initialData.email,
            address: initialData.address,
            description: initialData.description,
            weekdayHours: initialData.businessHours?.weekdays ?? '',
            weekendHours: initialData.businessHours?.weekend ?? '',
        });
    }, [initialData]);

    const handleEdit = useCallback(() => {
        setIsEditing(true);
    }, []);

    const handleCancel = useCallback(() => {
        setIsEditing(false);
        setEditedData({
            name: storeData.name,
            type: storeData.type,
            phone: storeData.phone,
            email: storeData.email,
            address: storeData.address,
            description: storeData.description,
            weekdayHours: storeData.businessHours?.weekdays ?? '',
            weekendHours: storeData.businessHours?.weekend ?? '',
        });
    }, [storeData]);

    const handleSaveChanges = useCallback(async () => {
        console.log('💾 Saving changes for externalId:', externalId, editedData);
        try {
            // TODO: Update store in database using externalId
            // await updateStoreById(externalId, editedData);

            // Update local state
            setStoreData({
                ...storeData,
                name: editedData.name,
                type: editedData.type,
                phone: editedData.phone,
                email: editedData.email,
                address: editedData.address,
                description: editedData.description,
                businessHours: {
                    weekdays: editedData.weekdayHours,
                    weekend: editedData.weekendHours,
                },
            });
            setIsEditing(false);
            console.log('✅ Changes saved successfully');
            return true;
        } catch (error) {
            console.error('❌ Error saving changes:', error);
            return false;
        }
    }, [externalId, editedData, storeData]);

    const updateField = useCallback((field: keyof EditableStoreData, value: string) => {
        setEditedData((prev) => ({ ...prev, [field]: value }));
    }, []);

    return {
        isEditing,
        storeData,
        editedData,
        setIsEditing,
        handleEdit,
        handleCancel,
        handleSaveChanges,
        updateField,
    };
};

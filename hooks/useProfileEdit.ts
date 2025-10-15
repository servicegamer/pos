import { useState, useEffect, useCallback } from 'react';
import { UserProfileData } from '@/types';

export const useProfileEdit = (initialData: UserProfileData, externalId?: string) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState(initialData);

    // Reset edited data when initial data changes
    useEffect(() => {
        setEditedData(initialData);
    }, [initialData]);

    const handleEdit = useCallback(() => {
        setIsEditing(true);
    }, []);

    const handleCancel = useCallback(() => {
        setIsEditing(false);
        setEditedData(initialData);
    }, [initialData]);

    const handleSaveChanges = useCallback(async () => {
        console.log('💾 Saving changes for externalId:', externalId, editedData);
        try {
            // TODO: Update user in database using externalId
            // await updateUserByExternalId(externalId, editedData);

            setIsEditing(false);
            console.log('✅ Changes saved successfully');
            return true;
        } catch (error) {
            console.error('❌ Error saving changes:', error);
            return false;
        }
    }, [externalId, editedData]);

    const updateField = useCallback((field: keyof UserProfileData, value: any) => {
        setEditedData((prev) => ({ ...prev, [field]: value }));
    }, []);

    return {
        isEditing,
        editedData,
        setIsEditing,
        handleEdit,
        handleCancel,
        handleSaveChanges,
        updateField,
    };
};

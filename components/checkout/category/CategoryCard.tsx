import { Category } from '@/types';
import { useDatabase } from '@nozbe/watermelondb/react';
import React, { useRef } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';

interface CategoryCardProps {
    category: Category;
    onPress: (category: Category) => void;
}

// import User from "@/models/db/users";
// import { addUser } from "@/models/service/UserService";

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onPress }) => {
    const scaleValue = useRef(new Animated.Value(1)).current;
    const [isPressed, setIsPressed] = React.useState(false);
    const database = useDatabase();

    const handlePressIn = (): void => {
        setIsPressed(true);
        Animated.spring(scaleValue, {
            toValue: 0.95,
            useNativeDriver: true,
            tension: 300,
            friction: 10,
        }).start();
    };

    const handlePressOut = (): void => {
        setIsPressed(false);
        Animated.spring(scaleValue, {
            toValue: 1,
            useNativeDriver: true,
            tension: 300,
            friction: 10,
        }).start();
    };

    //DEBUG: This is just a placeholder code to make calls to the db to see if its working.
    // But should be removed as soon as we have the proper logic in place.
    // const dummyDBCall = async () => {
    //   console.log('We tapped the button and this is the provider');

    //   try {
    //     await database.get('users').query().fetch();
    //     console.log(database);
    //     console.log("Fetching users from database...");
    //     await addUser(database, "John", "Doe", "1234567890", "hashedpassword");
    //     console.log("User added successfully");
    //     database.get<User>('users').query().fetch().then(users => {
    //       console.log("Users in database:", users);
    //     })
    //   } catch (error) {
    //     console.error("Error fetching users:", error);
    //   }
    // }

    const handlePress = (): void => {
        console.log(`Selected category: ${category.name}`);
        onPress(category);
        //DEBUG: This is just a placeholder code to make calls to the db to see if its working.
        // But should be removed as soon as we have the proper logic in place.
    };

    return (
        <TouchableOpacity
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handlePress}
            activeOpacity={1} // Disable default opacity change
            className='flex-1 min-w-[45%] max-w-[45%] m-2'>
            <Animated.View
                className={`${category.color} rounded-2xl p-4`}
                style={{
                    transform: [{ scale: scaleValue }],
                    shadowColor: '#000',
                    shadowOffset: {
                        width: 0,
                        height: isPressed ? 6 : 4,
                    },
                    shadowOpacity: isPressed ? 0.15 : 0.1,
                    shadowRadius: isPressed ? 8 : 6,
                    elevation: isPressed ? 6 : 4,
                }}>
                <View className='flex-row items-center justify-between mb-2'>
                    <Text className='text-2xl'>{category.icon}</Text>
                    <Animated.View
                        className='bg-white rounded-full px-2 py-1'
                        style={{
                            transform: [{ scale: scaleValue }],
                        }}>
                        <Text className='text-xs font-medium text-gray-600'>{category.count}</Text>
                    </Animated.View>
                </View>
                <Text className='text-gray-800 font-medium text-sm'>{category.name}</Text>
            </Animated.View>
        </TouchableOpacity>
    );
};

export default CategoryCard;

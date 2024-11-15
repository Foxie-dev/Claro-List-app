import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import TaskScreen from '../screens/TaskScreen';
import { StyleSheet } from 'react-native';

// Define types for each screen's route parameters
export type RootStackParamList = {
  HomeScreen: undefined;
  Task: { folderName: string };
};

// Create a Stack Navigator with defined types
const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => (
  <Stack.Navigator initialRouteName="HomeScreen">
    <Stack.Screen 
      name="HomeScreen" 
      component={HomeScreen} 
      options={{ 
        title: 'Claro-List',
        headerStyle: styles.headerStyle,
        headerTitleStyle: styles.headerTitleStyle,
        headerTintColor: '#FFFFFF', // White text color
      }} 
    />
    <Stack.Screen
      name="Task"
      component={TaskScreen}
      options={({ route }) => ({ 
        title: route.params.folderName,
        headerStyle: styles.headerStyle,
        headerTitleStyle: styles.headerTitleStyle,
        headerTintColor: '#FFFFFF', // White text color
      })}
    />
  </Stack.Navigator>
);

const styles = StyleSheet.create({
  headerStyle: {
    backgroundColor: '#FF6347', // Tomato-colored background
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 6,
  },
  headerTitleStyle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF', // White color
    textAlign: 'center',
    textShadowColor: '#FF4500', // Bright red shadow
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
});

export default AppNavigator;

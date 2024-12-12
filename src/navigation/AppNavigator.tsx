// src/navigation/AppNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DeviceScanScreen from '../screens/DeviceScanScreen';
import DeviceConnectedScreen from '../screens/DeviceConnectedScreen';
import WiFiConfigurationScreen from '../screens/WiFiConfigurationScreen';
import ConfigurationPendingScreen from '../screens/ConfigurationPendingScreen';
import ConfigurationSuccessScreen from '../screens/ConfigurationSuccessScreen';

export type RootStackParamList = {
  DeviceScan: undefined;
  DeviceConnected: undefined;
  WiFiConfiguration: undefined;
  ConfigurationPending: undefined;
  ConfigurationSuccess: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DeviceScan" component={DeviceScanScreen} />
      <Stack.Screen name="DeviceConnected" component={DeviceConnectedScreen} />
      <Stack.Screen name="WiFiConfiguration" component={WiFiConfigurationScreen} />
      <Stack.Screen name="ConfigurationPending" component={ConfigurationPendingScreen} />
      <Stack.Screen name="ConfigurationSuccess" component={ConfigurationSuccessScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;

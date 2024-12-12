import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { BleProvider } from './src/BleContext';

const App = () => {
  return (
    <PaperProvider>
      <BleProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </BleProvider>
    </PaperProvider>
  );
};

export default App;

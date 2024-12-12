import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#A30E2D', // Un rouge profond, élégant
    onPrimary: '#FFFFFF',
    background: '#F9F9F9',
    surface: '#FFFFFF',
    text: '#333333',
    placeholder: '#999999',
    // Ajustements subtils des couleurs
  },
  roundness: 8,
};

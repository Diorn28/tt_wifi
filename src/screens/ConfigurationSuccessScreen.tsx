// src/screens/ConfigurationSuccessScreen.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

const ConfigurationSuccessScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Le Lahoco est configuré avec succès.</Text>
      <Button mode="contained" onPress={() => navigation.reset({ index:0, routes:[{name:'DeviceScan'}]})}>
        Retour à l'accueil
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex:1, backgroundColor:'#F9F9F9', justifyContent:'center', alignItems:'center', padding:20},
  text: { marginBottom:20, color:'#333', fontWeight:'600'}
});

export default ConfigurationSuccessScreen;

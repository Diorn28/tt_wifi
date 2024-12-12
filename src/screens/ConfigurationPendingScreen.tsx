// src/screens/ConfigurationPendingScreen.tsx
import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, ActivityIndicator, Button } from 'react-native-paper';
import { BleContext } from '../BleContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

const ConfigurationPendingScreen: React.FC = () => {
  const { notificationMessage } = useContext(BleContext);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [error, setError] = useState<boolean>(false);

  // Timeout de 1 minute
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!notificationMessage || (notificationMessage !== 'SUCCESS' && notificationMessage !== 'FAILED')) {
        setError(true);
      }
    }, 60000);
    return () => clearTimeout(timer);
  }, [notificationMessage]);

  // Réagir aux notifications
  useEffect(() => {
    console.log('notificationMessage changed:', notificationMessage);
    if (notificationMessage === 'SUCCESS') {
      navigation.navigate('ConfigurationSuccess');
    } else if (notificationMessage === 'FAILED') {
      setError(true);
    }
  }, [notificationMessage, navigation]);


  return (
    <View style={styles.container}>
      {!error ? (
        <>
          <ActivityIndicator />
          <Text style={styles.text}>Configuration du Lahoco en cours...</Text>
          <Text style={styles.subtext}>Cette opération peut prendre quelques minutes</Text>
        </>
      ) : (
        <>
          <Text style={styles.text}>Échec de la configuration</Text>
          <Button mode="contained" onPress={() => navigation.goBack()}>
            Réessayer
          </Button>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#F9F9F9', justifyContent:'center', alignItems:'center', padding:20 },
  text: { marginBottom:10, color:'#333', fontWeight:'600' },
  subtext: { marginBottom:20, color:'#555' },
});

export default ConfigurationPendingScreen;

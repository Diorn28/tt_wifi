import React, { useState } from 'react';
import {
  View,
  Text,
  Button,
  FlatList,
  TextInput,
  Alert,
  StyleSheet, PermissionsAndroid,
} from 'react-native';
import WifiManager from 'react-native-wifi-reborn';

type WifiNetwork = {
  SSID: string;
  BSSID: string;
};

const HomeScreen: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [wifiList, setWifiList] = useState<WifiNetwork[]>([]);
  const [selectedSSID, setSelectedSSID] = useState('');
  const [password, setPassword] = useState('');

  const requestPermissions = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Permission de localisation requise',
          message: "Cette application a besoin d'accéder à votre localisation pour scanner les réseaux Wi-Fi.",
          buttonNeutral: 'Demander plus tard',
          buttonNegative: 'Annuler',
          buttonPositive: 'OK',
        }
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Permission de localisation accordée');
        return true;
      } else {
        console.log('Permission de localisation refusée');
        Alert.alert(
          'Permission refusée',
          'Vous devez accorder la permission de localisation pour scanner les réseaux Wi-Fi.'
        );
        return false;
      }
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const scanWifi = async () => {
    const permissionGranted = await requestPermissions();

    if (!permissionGranted) {
      return;
    }

    try {
      const networks = await WifiManager.loadWifiList();
      setWifiList(networks);
    } catch (error) {
      console.error('Erreur lors du scan des Wi-Fi :', error);
      Alert.alert('Erreur', 'Impossible de scanner les réseaux Wi-Fi.');
    }
  };


  const connectToWifi = async () => {
    if (!selectedSSID) {
      Alert.alert('Erreur', 'Veuillez entrer un SSID et un mot de passe.');
      return;
    }
    setIsLoading(true);
    try {
      await WifiManager.disconnect();
      await WifiManager.connectToProtectedSSID(selectedSSID, password, false, false);
      Alert.alert('Succès', `Connecté au réseau ${selectedSSID}`);
    } catch (error) {
      console.error('Error connecting to Wi-Fi:', error);
      Alert.alert('Erreur', 'Impossible de se connecter au réseau.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Réseaux Wi-Fi disponibles</Text>
      <Button title="Scanner les réseaux Wi-Fi" onPress={scanWifi} />
      <FlatList
        data={wifiList}
        keyExtractor={(item) => item.BSSID}
        renderItem={({ item }) => (
          <Text
            style={styles.network}
            onPress={() => setSelectedSSID(item.SSID)}
          >
            {item.SSID}
          </Text>
        )}
      />
      {selectedSSID ? (
        <View style={styles.connectionForm}>
          <Text style={styles.label}>SSID sélectionné : {selectedSSID}</Text>
          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <Button title="Se connecter" onPress={connectToWifi} />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  network: {
    fontSize: 18,
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  connectionForm: {
    marginTop: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
});

export default HomeScreen;

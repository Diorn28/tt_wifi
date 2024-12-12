import React, { useContext, useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TextInput, Alert } from 'react-native';
import { Text, Button, ActivityIndicator } from 'react-native-paper';
import { BleContext } from '../BleContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

const WiFiConfigurationScreen: React.FC = () => {
  const { connectedDevice, enableNotifications, writeValue, readValue } = useContext(BleContext);
  const [wifiList, setWifiList] = useState<string[]>([]);
  const [selectedSSID, setSelectedSSID] = useState('');
  const [password, setPassword] = useState('');
  const [isFetchingWifi, setIsFetchingWifi] = useState(false);
  const [isSendingCredentials, setIsSendingCredentials] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const SERVICE_UUID = '5e5f229a-87c3-43f8-96f7-ec285be1a742';
  const WIFI_CHAR_UUID = '6fe6d32a-2d28-4db8-a239-9ce3ca6bbf50'; // Pour lire les réseaux
  const CREDENTIALS_CHAR_UUID = '6f544163-4bfd-40ce-bb44-0599b39ad2e9'; // Pour envoyer SSID/Password et recevoir SUCCESS/FAILED

  const fetchAvailableWifi = async () => {
    if (!connectedDevice) {
      Alert.alert('Error', 'No connected device.');
      return;
    }
    setIsFetchingWifi(true);
    try {
      const networks = await readValue(SERVICE_UUID, WIFI_CHAR_UUID);
      setWifiList(networks);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch Wi-Fi networks.');
    } finally {
      setIsFetchingWifi(false);
    }
  };

  const sendWifiCredentials = async () => {
    if (!connectedDevice) {
      Alert.alert('Error', 'No connected device.');
      return;
    }
    if (!selectedSSID || !password) {
      Alert.alert('Error', 'Select a network and enter a password.');
      return;
    }

    setIsSendingCredentials(true);

    try {
      console.log('Enabling notifications before writing credentials...');
      // Assurez-vous que le device est connecté (connectedDevice non null)
      // Appelez enableNotifications d'abord
      enableNotifications(SERVICE_UUID, CREDENTIALS_CHAR_UUID);

      console.log('Notifications enabled. Now writing credentials...');
      await writeValue(SERVICE_UUID, CREDENTIALS_CHAR_UUID, `${selectedSSID}\0${password}`);

      console.log('Credentials written. Navigating to ConfigurationPending...');
      navigation.navigate('ConfigurationPending');
    } catch (error) {
      Alert.alert('Error', 'Failed to send credentials.');
    } finally {
      setIsSendingCredentials(false);
    }
  };

  useEffect(() => {
    // Facultatif : on peut fetch les réseaux dès l'arrivée sur l'écran
    fetchAvailableWifi();
  }, []);

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Wi-Fi Setup</Text>

      <Button
        mode="contained"
        onPress={fetchAvailableWifi}
        style={styles.button}
      >
        Fetch Wi-Fi
      </Button>

      {isFetchingWifi && <ActivityIndicator style={{ marginVertical: 20 }} />}

      <FlatList
        data={wifiList}
        keyExtractor={(item, index) => index.toString()}
        style={{ marginVertical: 20 }}
        renderItem={({ item }) => (
          <Button
            mode={item === selectedSSID ? 'contained' : 'outlined'}
            onPress={() => setSelectedSSID(item)}
            style={{ marginBottom: 10 }}
          >
            {item}
          </Button>
        )}
      />

      {selectedSSID !== '' && (
        <View style={styles.credentialsContainer}>
          <Text>SSID: {selectedSSID}</Text>
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="#999"
          />
          <Button
            mode="contained"
            onPress={sendWifiCredentials}
            disabled={isSendingCredentials}
          >
            {isSendingCredentials ? 'Sending...' : 'Send Credentials'}
          </Button>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9', padding: 20 },
  title: { marginBottom: 20, color: '#333', fontWeight:'600' },
  button: { alignSelf: 'flex-start', marginBottom: 20 },
  credentialsContainer: { marginTop: 20 },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    color: '#333'
  }
});

export default WiFiConfigurationScreen;

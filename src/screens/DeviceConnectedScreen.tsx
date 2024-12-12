// src/screens/DeviceConnectedScreen.tsx
import React, { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, ActivityIndicator } from 'react-native-paper';
import { BleContext } from '../BleContext';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

const DeviceConnectedScreen: React.FC = () => {
  const { connectedDevice, disconnect, connecting } = useContext(BleContext);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  if (connecting) {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
        <Text style={{ marginTop: 20 }}>Connecting...</Text>
      </View>
    );
  }

  if (!connectedDevice) {
    return (
      <View style={styles.container}>
        <Text>No device connected</Text>
        <Button mode="contained" onPress={() => navigation.reset({index:0, routes:[{name:'DeviceScan'}]})}>
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Icon name="devices-other" size={48} color="#333" style={{ marginBottom: 20 }}/>
      <Text variant="headlineMedium" style={styles.title}>Connected</Text>
      <Text>{connectedDevice.name || 'Unknown'}</Text>
      <Text style={styles.deviceId}>{connectedDevice.id}</Text>

      <Button
        mode="contained"
        style={styles.button}
        onPress={() => navigation.navigate('WiFiConfiguration')}
        icon={() => <Icon name="wifi" size={20} color="#fff" />}
      >
        Wi-Fi
      </Button>

      <Button
        mode="text"
        onPress={disconnect}
      >
        Disconnect
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#F9F9F9', padding:20, justifyContent:'center', alignItems:'center' },
  title: { marginBottom:20, color:'#333', fontWeight:'600' },
  deviceId: { marginBottom:30, color:'#999', fontSize:12 },
  button: { marginBottom:20 }
});

export default DeviceConnectedScreen;

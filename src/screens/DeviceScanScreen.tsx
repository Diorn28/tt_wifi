// src/screens/DeviceScanScreen.tsx
import React, { useContext, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text, Button, ActivityIndicator } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BleContext } from '../BleContext';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { requestBluetoothPermission } from '../utils/permissions';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import {Device} from 'react-native-ble-plx';

const DeviceScanScreen: React.FC = () => {
  const { scanDevices, connectToDevice, reset } = useContext(BleContext);
  const [devices, setDevices] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useFocusEffect(
    React.useCallback(() => {
      reset();
    }, [reset])
  );

  const startScan = async () => {
    const permission = await requestBluetoothPermission();
    if (!permission) return;
    setIsScanning(true);
    const foundDevices = await scanDevices(5000);
    setDevices(foundDevices as any);
    setIsScanning(false);
  };

  const onSelectDevice = async (device:Device) => {
    await connectToDevice(device);
    navigation.navigate('DeviceConnected');
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Scan</Text>
      <Button
        mode="contained"
        onPress={startScan}
        style={styles.button}
        icon={() => <Icon name="bluetooth-searching" size={20} color="#fff" />}
      >
        Scan Devices
      </Button>

      {isScanning && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator />
          <Text style={styles.loadingText}>Scanning...</Text>
        </View>
      )}

      {!isScanning && devices.length === 0 && (
        <Text style={styles.noDevicesText}>No devices found</Text>
      )}

      <FlatList
        data={devices}
        keyExtractor={(item: any) => item.id}
        style={styles.list}
        renderItem={({ item }: { item: any }) => (
          <View style={styles.listItem}>
            <View style={{ flex: 1 }}>
              <Text>{item.name || 'Unknown Device'}</Text>
              <Text style={styles.deviceId}>{item.id}</Text>
            </View>
            <Button
              mode="text"
              onPress={() => onSelectDevice(item)}
              icon={() => <Icon name="chevron-right" size={20} color="#000" />}
            >
              Select
            </Button>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9', padding: 20 },
  title: { marginBottom: 20, color: '#333', fontWeight:'600' },
  button: { alignSelf: 'flex-start', marginBottom: 20 },
  loadingContainer: { alignItems:'center', justifyContent:'center', marginVertical:20 },
  loadingText: { marginTop:10, color:'#333' },
  noDevicesText: { marginVertical:20, color:'#333' },
  list: { marginTop:10 },
  listItem: {
    backgroundColor:'#FFFFFF',
    padding:15,
    borderRadius:8,
    marginBottom:10,
    flexDirection:'row',
    alignItems:'center',
  },
  deviceId: { color:'#999', fontSize:12 },
});

export default DeviceScanScreen;

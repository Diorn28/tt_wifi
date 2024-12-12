import { PermissionsAndroid, Platform, Alert } from 'react-native';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

export const requestBluetoothPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    ]);
    if (
      granted['android.permission.BLUETOOTH_SCAN'] !== PermissionsAndroid.RESULTS.GRANTED ||
      granted['android.permission.BLUETOOTH_CONNECT'] !== PermissionsAndroid.RESULTS.GRANTED
    ) {
      Alert.alert('Permission denied', 'Bluetooth permissions are required.');
      return false;
    }
  } else {
    const status = await request(PERMISSIONS.IOS.BLUETOOTH);
    if (status !== RESULTS.GRANTED) {
      Alert.alert('Permission denied', 'Bluetooth permission is required.');
      return false;
    }
  }
  return true;
};

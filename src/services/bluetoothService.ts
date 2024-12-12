// src/services/bluetoothService.ts
import { BleManager, Device } from 'react-native-ble-plx';
import { Buffer } from 'buffer';

class BluetoothService {
  private manager: BleManager;
  private connectedDevice: Device | null = null;
  private notificationCallback: ((message: string) => void) | null = null;

  constructor() {
    this.manager = new BleManager();
  }

  public async scanForDevices(duration = 5000): Promise<Device[]> {
    const devicesFound: Device[] = [];
    await new Promise<void>((resolve) => {
      this.manager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          console.log('Scan error:', error);
          stopScan();
          return;
        }
        if (device && device.name) {
          const exists = devicesFound.some(d => d.id === device.id);
          if (!exists) devicesFound.push(device);
        }
      });

      const stopScan = () => {
        this.manager.stopDeviceScan();
        resolve();
      };

      setTimeout(stopScan, duration);
    });
    return devicesFound;
  }

  public async connectToDevice(device: Device) {
    const connected = await this.manager.connectToDevice(device.id);
    await connected.discoverAllServicesAndCharacteristics();
    this.connectedDevice = connected;

    // Surveiller déconnexions
    this.manager.onDeviceDisconnected(connected.id, () => {
      this.connectedDevice = null;
    });
  }

  public async disconnect() {
    if (this.connectedDevice) {
      await this.manager.cancelDeviceConnection(this.connectedDevice.id);
      this.connectedDevice = null;
    }
  }

  public getConnectedDevice(): Device | null {
    return this.connectedDevice;
  }

  public enableNotifications(serviceUUID: string, characteristicUUID: string, callback: (message: string) => void) {
    if (!this.connectedDevice) return;
    this.notificationCallback = callback;

    this.connectedDevice.monitorCharacteristicForService(
      serviceUUID,
      characteristicUUID,
      (error, characteristic) => {
        if (error) {
          console.log('Notification error:', error);
          return;
        }
        if (characteristic?.value) {
          const message = Buffer.from(characteristic.value, 'base64').toString('utf-8');
          if (this.notificationCallback) this.notificationCallback(message);
        }
      }
    );
  }

  public async writeValue(serviceUUID: string, characteristicUUID: string, data: string): Promise<void> {
    if (!this.connectedDevice) return;
    const services = await this.connectedDevice.services();
    for (const service of services) {
      if (service.uuid === serviceUUID) {
        const characteristics = await service.characteristics();
        for (const characteristic of characteristics) {
          if (characteristic.uuid === characteristicUUID) {
            await characteristic.writeWithResponse(Buffer.from(data, 'utf-8').toString('base64'));
          }
        }
      }
    }
  }

  public async readValue(serviceUUID: string, characteristicUUID: string): Promise<string[]> {
    if (!this.connectedDevice) return [];
    const services = await this.connectedDevice.services();
    for (const service of services) {
      if (service.uuid === serviceUUID) {
        const characteristics = await service.characteristics();
        for (const characteristic of characteristics) {
          if (characteristic.uuid === characteristicUUID) {
            const value = await characteristic.read();
            const wifiNetworks = value.value
              ? Buffer.from(value.value, 'base64').toString().split(',')
              : [];
            return [...new Set(wifiNetworks)].filter(n => n.trim() !== '');
          }
        }
      }
    }
    return [];
  }

  public reset() {
    this.connectedDevice = null;
    this.notificationCallback = null;
  }
}

export const bluetoothService = new BluetoothService();

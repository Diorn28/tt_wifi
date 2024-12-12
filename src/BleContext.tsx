// BleContext.tsx
import React, { createContext, useState, useEffect } from 'react';
import { Device } from 'react-native-ble-plx';
import { Alert } from 'react-native';
import { bluetoothService } from './services/bluetoothService';

interface BleContextProps {
  connectedDevice: Device | null;
  notificationMessage: string | null;
  connecting: boolean;
  reconnecting: boolean;
  disconnectedUnexpectedly: boolean;
  scanDevices: (duration?: number) => Promise<Device[]>;
  connectToDevice: (device: Device) => Promise<void>;
  disconnect: () => Promise<void>;
  reset: () => void;
  enableNotifications: (serviceUUID: string, characteristicUUID: string) => void;
  writeValue: (serviceUUID: string, characteristicUUID: string, data: string) => Promise<void>;
  readValue: (serviceUUID: string, characteristicUUID: string) => Promise<string[]>;
}

export const BleContext = createContext<BleContextProps>({
  connectedDevice: null,
  notificationMessage: null,
  connecting: false,
  reconnecting: false,
  disconnectedUnexpectedly: false,
  scanDevices: async () => [],
  connectToDevice: async () => {},
  disconnect: async () => {},
  reset: () => {},
  enableNotifications: () => {},
  writeValue: async () => {},
  readValue: async () => [],
});

export const BleProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);
  const [connectedDeviceState, setConnectedDeviceState] = useState<Device | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [disconnectedUnexpectedly, setDisconnectedUnexpectedly] = useState(false);
  const [lastDevice, setLastDevice] = useState<Device | null>(null);

  const scanDevices = async (duration = 5000): Promise<Device[]> => {
    return bluetoothService.scanForDevices(duration);
  };

  const connectToDevice = async (device: Device) => {
    setConnecting(true);
    try {
      await bluetoothService.connectToDevice(device);
      setConnectedDeviceState(bluetoothService.getConnectedDevice());
      setLastDevice(device);
    } catch (error) {
      Alert.alert('Error', 'Failed to connect.');
      reset();
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = async () => {
    // Déconnexion volontaire, on ne tente pas de se reconnecter
    await bluetoothService.disconnect();
    reset();
  };

  const reset = () => {
    bluetoothService.reset();
    setNotificationMessage(null);
    setConnectedDeviceState(null);
    setConnecting(false);
    setReconnecting(false);
    setDisconnectedUnexpectedly(false);
  };

  const enableNotifications = (serviceUUID: string, characteristicUUID: string) => {
    bluetoothService.enableNotifications(serviceUUID, characteristicUUID, (message) => {
      setNotificationMessage(message);
    });
  };

  const writeValue = async (serviceUUID: string, characteristicUUID: string, data: string) => {
    await bluetoothService.writeValue(serviceUUID, characteristicUUID, data);
  };

  const readValue = async (serviceUUID: string, characteristicUUID: string) => {
    return bluetoothService.readValue(serviceUUID, characteristicUUID);
  };

  // Gestion de la déconnexion inattendue :
  // On surveille en continu l'état de bluetoothService.getConnectedDevice().
  // Si à un moment donné connectedDeviceState n'est plus synchrone ou si on détecte que bluetoothService est null
  // Mieux : On modifie bluetoothService pour qu'il puisse informer le contexte de la déconnexion.

  useEffect(() => {
    // On va interroger periodiquement le device. Si lastDevice existe et connectedDeviceState est null,
    // et qu'on n'est pas déjà en train de reconnecter ni juste après un disconnect volontaire,
    // on considère qu'il s'agit d'une déconnexion inattendue et on tente une reconnexion.

    const interval = setInterval(async () => {
      const currentDevice = bluetoothService.getConnectedDevice();
      if (lastDevice && !currentDevice && !connecting && !reconnecting && connectedDeviceState) {
        // Déconnexion inattendue
        setDisconnectedUnexpectedly(true);
        setReconnecting(true);

        Alert.alert('Déconnexion', 'Périphérique déconnecté, tentative de reconnexion...');
        const start = Date.now();

        let reconnected = false;
        // On tente de se reconnecter pendant 20 secondes
        while ((Date.now() - start) < 20000 && !reconnected) {
          try {
            await bluetoothService.connectToDevice(lastDevice);
            const dev = bluetoothService.getConnectedDevice();
            if (dev) {
              reconnected = true;
              setConnectedDeviceState(dev);
              Alert.alert('Reconnexion', 'Périphérique reconnecté avec succès.');
            }
          } catch (error) {
            // on attend un peu avant de retenter
            await new Promise(res => setTimeout(res, 2000));
          }
        }

        if (!reconnected) {
          Alert.alert('Reconnexion impossible', 'Impossible de se reconnecter après 20 secondes. Retour à l\'accueil.');
          reset();
        }

        setReconnecting(false);
        setDisconnectedUnexpectedly(false);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [lastDevice, connectedDeviceState, connecting, reconnecting]);

  return (
    <BleContext.Provider value={{
      connectedDevice: connectedDeviceState,
      notificationMessage,
      connecting,
      reconnecting,
      disconnectedUnexpectedly,
      scanDevices,
      connectToDevice,
      disconnect,
      reset,
      enableNotifications,
      writeValue,
      readValue
    }}>
      {children}
    </BleContext.Provider>
  );
};

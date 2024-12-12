import {AppRegistry} from 'react-native';
import App from './App'; // ou './src/App' si App.tsx est dans src
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);

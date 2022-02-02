import 'expo-dev-client';

import { registerRootComponent } from 'expo';

import App from './App';

import { clearAsyncStorage } from './reuseableFunctions/helpers';

import {registerForPushNotificationsAsync,setUpListeners} from './notifications/helpers';

//get push notification permissions.
console.log("TEST!");

async() => {clearAsyncStorage()};

registerForPushNotificationsAsync();
setUpListeners();

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

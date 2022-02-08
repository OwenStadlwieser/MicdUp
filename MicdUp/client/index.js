import "expo-dev-client";

import { registerRootComponent } from "expo";

import * as Notifications from "expo-notifications";

import App from "./App";

import { clearAsyncStorage } from "./reuseableFunctions/helpers";

import {
  registerForPushNotificationsAsync,
  setUpListeners,
} from "./notifications/helpers";

//get push notification permissions.

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

registerForPushNotificationsAsync();
setUpListeners();

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

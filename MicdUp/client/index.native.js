import "expo-dev-client";
import "react-native-gesture-handler";
import { registerRootComponent } from "expo";

import * as Notifications from "expo-notifications";

import App from "./App";

import TrackPlayer from "react-native-track-player";
import { clearAsyncStorage } from "./reuseableFunctions/helpers";
import Service from "./service";
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

TrackPlayer.registerPlaybackService(Service);
(async () => {
  await TrackPlayer.setupPlayer();
})();

//async() => clearAsyncStorage();
registerForPushNotificationsAsync();

setUpListeners();

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

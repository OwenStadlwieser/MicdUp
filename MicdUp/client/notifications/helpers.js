import * as Notifications from 'expo-notifications';
import { storeData, getData } from '../reuseableFunctions/helpers';
import store from '../redux';
import { Platform } from 'react-native';

const registerForPushNotificationsAsync = async () => {
    if(getData("expoToken")){
        let token = await getData("expoPushToken");
        console.log(token);
        return;
    }
    console.log(Platform.OS);
    if (Platform.OS) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log(token);
      // this.setState({ expoPushToken: token });
      storeData("expoPushToken",token);
    } else {
      alert('Must use physical device for Push Notifications');
    }
  
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notification.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
};

const receiveNotificationListener = (notification) => {
    let loggedIn = false;
    try{
        loggedIn = store.getState().auth.loggedIn;
    }catch(e){
        //not logged in yet
        return
    }

    if (!loggedIn){
        return;
    }

    console.log(notification)

}

const setUpListeners = () => {
    Notifications.addNotificationReceivedListener((notification) => receiveNotificationListener(notification));
}




export {registerForPushNotificationsAsync,setUpListeners};
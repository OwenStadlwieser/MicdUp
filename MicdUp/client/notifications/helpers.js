import * as Notifications from 'expo-notifications';
import { storeData, getData } from '../reuseableFunctions/helpers';
import store from '../redux';
import { Platform } from 'react-native';

import { addToken } from '../redux/actions/notifs';




const registerForPushNotificationsAsync = async () => {
    if(await getData("expoToken")){
        let token = await getData("expoPushToken");
        console.log("FOUND TOKEN!");
        console.log(token);
        return;
    }


    if (Platform.OS !== 'web') {
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
      console.log("new token: ");
      const addToDB = await addToken(token);

      if (addToDB){
        console.log("Push Token added to DB");
      }

      // this.setState({ expoPushToken: token });
      storeData("expoPushToken",token);
    } else {
      alert('Must use physical device for Push Notifications');
    }
  
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
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
        //not logged in yet maybe. or redux broke
        console.log("not logged in!");
        return
    }


    if (!loggedIn){
        console.log("not logged in!");
        return;
    }

    console.log(notification)

}

const setUpListeners = () => {
    Notifications.addNotificationReceivedListener((notification) => receiveNotificationListener(notification));
}




export {registerForPushNotificationsAsync,setUpListeners};
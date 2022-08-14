import * as Notifications from "expo-notifications";
import { storeData, getData } from "../reuseableFunctions/helpers";
import store from "../redux";
import { Platform } from "react-native";
import { connect } from "react-redux";

import { addToken } from "../redux/actions/notifs";
import { receiveNotif } from "../redux/actions/display";
import { rollbar } from "../reuseableFunctions/constants";
import { NotificationTypesFrontend } from "./NotificationTypes";
import { openSpecificPost } from "../redux/actions/recording";
import { navigate } from "../redux/actions/display";
import { searchViewProfile } from "../redux/actions/display";
import { viewProfile } from "../redux/actions/display";
import { createOrOpenChat } from "../redux/actions/chat";
import { showComments } from "../redux/actions/display";
import { SINGLE_POST_KEY } from "../reuseableFunctions/constants";
const MAX_NOTIFICATION_QUEUE_SIZE = 10;

const registerForPushNotificationsAsync = async () => {
  rollbar.log("Registering");
  if (await getData("expoToken")) {
    let token = await getData("expoPushToken");
    console.log("FOUND TOKEN!");
    console.log(token);
    return;
  }

  await storeData("notifications", "[]");

  if (Platform.OS !== "web") {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log("new token: ");
    console.log(token);

    const addToDB = await addToken(token);

    if (addToDB) {
      console.log("Push Token added to DB");
    } else {
      console.log("Failed to add push token!");
    }

    // this.setState({ expoPushToken: token });
    storeData("expoPushToken", token);
  } else {
    alert("Must use physical device for Push Notifications");
  }

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }
};

/*
Notification content:
{
      id:id
      content:content,
      image:image,
      navTo:navTo
}
*/
const receiveNotificationListener = async (notification) => {
  //   let loggedIn = store.getState().auth.loggedIn;

  //   if (!loggedIn){
  //     console.log("not logged in!");
  //     return;
  // }

  //console.log("LOGGED IN!");
  // add to redux state
  let notifs = await getData("notifications");

  if (!notifs) {
    notifs = "[]";
  }

  notifs = JSON.parse(notifs);

  if (notifs.length >= MAX_NOTIFICATION_QUEUE_SIZE) {
    //remove from front of notifs array if you got too many.
    //might want to add something for compacting notifications. i.e you received 20 likes on this post.
    notifs.shift();
  }

  //add to notification list.
  notifs.push(notification);

  console.log(notifs);

  storeData("notifications", JSON.stringify(notifs));

  //update redux state!
  store.dispatch(receiveNotif());

  console.log(notification);
};

const notificationAppResponse = async (data) => {
  const { sender, text, itemId, parentId, dateCreated } = data;
  let { user, ipAddr } = store.getState().auth;
  let profile = user.profile;
  switch (data.type) {
    case NotificationTypesFrontend.LikePost:
      await store.dispatch(openSpecificPost(itemId, null));
      store.dispatch(navigate("SinglePostContainer"));
      break;
    case NotificationTypesFrontend.CommentPost:
      await store.dispatch(openSpecificPost(parentId, itemId));
      store.dispatch(navigate("SinglePostContainer"));
      store.dispatch(showComments(0, SINGLE_POST_KEY));
      break;
    case NotificationTypesFrontend.Follow:
      if (profile && profile.id === sender.id) {
        store.dispatch(navigate("Profile"));
        this.mounted && this.setState({ showing: false });
        break;
      }
      store.dispatch(viewProfile({ ...sender }));
      store.dispatch(searchViewProfile(true));
      store.dispatch(navigate("SearchProfile"));
      break;
    case NotificationTypesFrontend.SendMessage:
      await store.dispatch(createOrOpenChat([], "", parentId));
      break;
    case NotificationTypesFrontend.ReplyComment:
      await store.dispatch(openSpecificPost(parentId, itemId));
      store.dispatch(navigate("SinglePostContainer"));
      store.dispatch(showComments(0, SINGLE_POST_KEY));
      break;
    case NotificationTypesFrontend.LikeComment:
      await store.dispatch(openSpecificPost(parentId, itemId));
      store.dispatch(navigate("SinglePostContainer"));
      store.dispatch(showComments(0, SINGLE_POST_KEY));
      break;
  }
};
const notificationResponseReceivedListener = async (response) => {
  rollbar.log(response);
  rollbar.log("Notification Response Receiverd", response);
  try {
    const data = response.notification.request.content.data;
    await notificationAppResponse(data);
    rollbar.log(data);
  } catch (err) {
    rollbar.error(err);
  }
  console.log(response);
};

const setUpListeners = () => {
  Notifications.addNotificationResponseReceivedListener(
    notificationResponseReceivedListener
  );
  Notifications.addNotificationReceivedListener((notification) => {
    rollbar.log(notification);
    rollbar.log("Notification Recieved", notification);
    receiveNotificationListener(notification);
  });
};

connect({}, { receiveNotif })(receiveNotificationListener);

export {
  registerForPushNotificationsAsync,
  setUpListeners,
  notificationAppResponse,
};

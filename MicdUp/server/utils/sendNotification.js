const { User } = require("../database/models/User");
const { Notif } = require("../database/models/Notif");
const { Expo } = require("expo-server-sdk");
const {
  NotificationTypesBackend,
  PostToContentType,
} = require("../utils/constants");
const mongoose = require("mongoose");

const expo = new Expo();

//this file will contain the logic for sending notifications for each action.

//private function used by others for sending out notifications
//title and body are self explanatory.
//data is the json data contained in the push notification.
//tokens is an array of the push tokens to send the notification to.
//sound is optional. leave blank for default sound.
const sendNotification = (title, body, data, tokens, sound = "default") => {
  let notifications = [];

  for (let token of tokens) {
    notifications.push({
      to: token,
      sound: sound,
      title: title,
      body: body,
      data: data,
    });
  }

  let chunks = expo.chunkPushNotifications(notifications);

  (async () => {
    for (let chunk of chunks) {
      try {
        //print out info for now.
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        console.log(ticketChunk);
      } catch (error) {
        console.log(error);
      }
    }
  })();

  console.log("notification sent");
};

//function for making a notification
//type is the type of content that was liked by a user. i.e post or comment
//sendTo is the user who's content was liked
//data can contain any metadata you want to carry with the notification. might be a redirect path etc.
// actionMessage is the message which describes the action
const makeNotification = async (
  sender,
  type,
  data,
  receiver,
  actionMessage,
  itemId
) => {
  if (!NotificationTypesBackend[type]) {
    throw new Error("Unknown type");
  }
  let title = sender.userName;
  let body =
    sender.userName + " " + actionMessage + " " + PostToContentType[type];

  let receiverUser = await User.findOne({ profile: receiver });
  if (title == receiverUser.userName) {
    return;
  }
  let tokens = receiverUser.pushTokens;

  let notif = await Notif.findOne({
    sender,
    receiver,
    itemId,
    type,
  });
  const now = new Date();
  // if the notif is less than one day old dont resend
  if (
    notif &&
    notif.dateCreated.getTime() > now.getTime() - 60 * 60 * 1000 * 24
  ) {
    notif.deleted = false;
    await notif.save();
    return;
  } else if (notif) {
    // more than one day old delete and make a new one
    await notif.delete();
  }

  console.log(
    "SENDING TO",
    notif.dateCreated.getTime(),
    now.getTime() - 60 * 60 * 1000 * 24
  );
  console.log(tokens);

  notif = new Notif({
    sender,
    receiver,
    text: body,
    itemId,
    type,
  });
  await notif.save();
  sendNotification(title, body, data, tokens);
};

// deletes notification from db
// TODO: unsend
const deleteNotification = async (sender, receiver, itemId, type) => {
  await Notif.findOneAndUpdate(
    {
      sender,
      receiver,
      itemId,
      type,
    },
    {
      deleted: true,
    }
  );
};
module.exports = { makeNotification, deleteNotification };

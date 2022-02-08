const {User} = require('../database/models/User')
const {Expo} = require("expo-server-sdk");
const mongoose = require("mongoose");

const expo = new Expo();


//this file will contain the logic for sending notifications for each action.

//private function used by others for sending out notifications
//title and body are self explanatory.
//data is the json data contained in the push notification.
//tokens is an array of the push tokens to send the notification to.
//sound is optional. leave blank for default sound.
const sendNotification = (title,body,data,tokens,sound = 'default') => {

    let notifications = [];
    
    for(let token of tokens){
        
        notifications.push({
            to:token,
            sound:sound,
            title:title,
            body:body,
            data:data,
        })
    }

    let chunks = expo.chunkPushNotifications(notifications);

    (async () => {
        for (let chunk of chunks) {
            try{
                //print out info for now.
                let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                console.log(ticketChunk);
            } catch(error){
                console.log(error);
            }
        }
    })();

    console.log("notification sent");
}

//function for making a like notification
//type is the type of content that was liked by a user. i.e post or comment
//sendTo is the user who's content was liked
//data can contain any metadata you want to carry with the notification. might be a redirect path etc.
const makeLikeNotification = async(user,type,data,likedProfileId) => {
    let title = user.userName;
    let body = user.userName + " liked your " + type;

    let session = await mongoose.startSession();

    let tokens = (await User.findOne({profile: likedProfileId })).pushTokens;

    console.log("SENDING TO");
    console.log(tokens);
    sendNotification(title,body,data,tokens);  

}

module.exports = {makeLikeNotification}
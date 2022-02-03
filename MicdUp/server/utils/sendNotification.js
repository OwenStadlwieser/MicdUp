const { CodeStarNotifications } = require("aws-sdk");
const {Expo} = require("expo-server-sdk");

const expo = new Expo();

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
}
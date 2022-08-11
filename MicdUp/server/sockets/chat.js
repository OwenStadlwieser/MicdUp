const activeUsers = new Set();
const jwt = require("jsonwebtoken");
const { Profile } = require("../database/models/Profile");
const { Chat } = require("../database/models/Chat");
const { User } = require("../database/models/User");
const { Message, File } = require("../database/models/File");
const { getCurrentTime } = require("../reusableFunctions/helpers");
const fs = require("fs");
var path = require("path");
const { makeNotification } = require("../utils/sendNotification");
const {
  NotificationTypesBackend,
  MESSAGE_MESSAGE,
} = require("../utils/constants");

const { getSignedUrl, getFile } = require("../utils/awsS3");
const {
  ffmpegMergeAndUpload,
  ffmpegGetDuration,
} = require("../database/privateSchema/mutations/recording");
var ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffprobePath = require("node-ffprobe-installer").path;
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);
const mongoose = require("mongoose");
var userIds = {};
exports = module.exports = function (io) {
  io.sockets.on("connection", async function (socket) {
    try {
      socket.on("new user", async function (token) {
        const userId = jwt.verify(token, "secret");
        console.log("new user connection");
        if (!userId || !userId.user) {
          throw new Error("Invalid token");
        }
        const profile = await Profile.findOne({ user: userId.user });
        if (!profile) {
          console.log(userId.user, "is not associated with a profile");
          throw new Error("Profile not found");
        }
        socket.profileId = profile._id;
        for (let i = 0; i < profile.chats.length; i++) {
          socket.join(profile.chats[i].toString());
        }
        userIds[socket.id] = profile._id;
      });

      socket.on("new message", async function (data) {
        const { messageData, chatId, fileType, speechToText } = data;
        socket.profileId = userIds[socket.id];
        console.log("new message");
        if (!socket.profileId) {
          throw new Error("must be logged in");
        }

        const chat = await Chat.findOne({
          _id: chatId,
          members: socket.profileId,
        });

        if (!chat) {
          throw new Error("Chat not found");
        }
        console.log(speechToText);
        const message = new Message({
          owner: socket.profileId,
          speechToText,
          fileExtension: ".mp4",
          dateCreated: getCurrentTime(),
        });

        var fileTypeFixed = fileType.replace("audio/", "");
        fileTypeFixed = fileTypeFixed.replace(".", "");
        var jsonPath = path.join(
          __dirname,
          "..",
          `${message._id}.${fileTypeFixed}`
        );
        const base64 = messageData.substr(messageData.indexOf(",") + 1);

        fs.writeFileSync(jsonPath, base64, "base64", function (err) {
          if (err) throw err;
          console.log("File is created successfully.");
        });

        var command = ffmpeg();
        command.input(jsonPath).inputFormat(fileTypeFixed);
        const fileName = path.join(__dirname, "..", `${message._id}.mp4`);
        const session = await mongoose.startSession();
        session.startTransaction();
        const fileNames = [];
        fileNames.push(jsonPath);

        try {
          const profileDoc = await Profile.findById(socket.profileId);
          const user = await User.findById(profileDoc.user);
          let image = await File.findById(profileDoc.image);
          if (image) {
            if (
              image.signedUrl &&
              image.lastFetched &&
              image.lastFetched + 60 * 30 < getCurrentTime()
            ) {
              image.signedUrl = image.signedUrl;
            } else {
              image.signedUrl = await getFile(image._id + image.fileExtension);
              image.lastFetched = getCurrentTime();
              await image.save({ session });
            }
          }
          await ffmpegMergeAndUpload(fileName, message._id, fileNames, command);
          const duration = await ffmpegGetDuration(fileName);
          message.duration = duration;
          message.signedUrl = await getSignedUrl(`${message._id}.mp4`);
          await message.save({ session });
          chat.messages.push(message._id);
          await chat.save({ session });
          await session.commitTransaction();
          let returnMessage = {};
          returnMessage.id = message._id;
          returnMessage.dateCreated = Math.floor(message.dateCreated.getTime());
          returnMessage.signedUrl = message.signedUrl;
          returnMessage.owner = {};
          returnMessage.owner.id = profileDoc._id;
          returnMessage.owner.image = image;
          returnMessage.owner.user = {};
          returnMessage.owner.user._id = user._id;
          returnMessage.owner.user.userName = user.userName;
          let blocked_member = false;
          for (member in chat.members) {
            if (profileDoc.blockedMap.get(`${member}`)) {
              blocked_member = true;
            }

            if (member != profileDoc.user) {
              console.log("making notification");
              await makeNotification(
                user,
                NotificationTypesBackend.SendMessage,
                {},
                member,
                MESSAGE_MESSAGE,
                message._id,
                chat._id
              );
            }
          }
          !blocked_member &&
            io.to(chatId).emit("new message", returnMessage, chat._id);
        } catch (err) {
          console.log(err);
          await session.abortTransaction();
        } finally {
          fs.unlink(fileName, function (err) {
            if (err) throw err;
          });
          session.endSession();
        }
      });

      socket.on("disconnect", () => {
        delete userIds[socket.id];
        activeUsers.delete(socket.userId);
      });
    } catch (err) {
      // FIXME: Handle socket error
      console.log(err);
    }
  });
};

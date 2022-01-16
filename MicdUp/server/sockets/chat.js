const activeUsers = new Set();
const jwt = require("jsonwebtoken");
const { Profile } = require("../database/models/Profile");
const { Chat } = require("../database/models/Chat");
const { User } = require("../database/models/User");
const { Message, File } = require("../database/models/File");
const fs = require("fs");
var path = require("path");
const { uploadFileFromBase64, getSignedUrl } = require("../utils/awsS3");
const {
  ffmpegMergeAndUpload,
} = require("../database/publicSchema/mutations/recording");
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
        if (!userId || !userId.user) {
          throw new Error("Invalid token");
        }
        const profile = await Profile.findOne({ user: userId.user });
        socket.profileId = profile._id;
        for (let i = 0; i < profile.chats.length; i++) {
          console.log("Joining", profile.chats[i].toString());
          socket.join(profile.chats[i].toString());
        }
        userIds[socket.id] = profile._id;
      });

      socket.on("new message", async function (data) {
        const { messageData, chatId, fileType } = data;
        socket.profileId = userIds[socket.id];

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

        const message = new Message({
          owner: socket.profileId,
          fileExtension: ".mp4",
        });

        var fileTypeFixed = fileType.replace("audio/", "");
        var jsonPath = path.join(
          __dirname,
          "..",
          "temp",
          `${message._id}${
            fileTypeFixed[0] === "." ? fileTypeFixed : "." + fileTypeFixed
          }`
        );
        const base64 = messageData.substr(messageData.indexOf(",") + 1);

        fs.writeFileSync(jsonPath, base64, "base64", function (err) {
          if (err) throw err;
          console.log("File is created successfully.");
        });

        var command = ffmpeg();
        command.input(jsonPath).inputFormat(fileTypeFixed);
        const fileName = path.join(
          __dirname,
          "..",
          "temp",
          `${message._id}.mp4`
        );
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
              image.lastFetched + 60 * 30 < Date.now()
            ) {
              image.signedUrl = image.signedUrl;
            } else {
              image.signedUrl = await getFile(
                parent._id + parent.fileExtension
              );
              image.lastFetched = Date.now();
              await image.save({ session });
            }
          }
          await ffmpegMergeAndUpload(fileName, message._id, fileNames, command);
          message.signedUrl = await getSignedUrl(`${message._id}.mp4`);
          await message.save({ session });
          chat.messages.push(message._id);
          await chat.save({ session });
          await session.commitTransaction();
          let returnMessage = {};
          returnMessage.id = message._id;
          returnMessage.dateCreated = message.dateCreated;
          returnMessage.signedUrl = message.signedUrl;
          returnMessage.owner = {};
          returnMessage.owner.id = profileDoc._id;
          returnMessage.owner.image = image;
          returnMessage.owner.user = {};
          returnMessage.owner.user._id = user._id;
          returnMessage.owner.user.userName = user.userName;
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

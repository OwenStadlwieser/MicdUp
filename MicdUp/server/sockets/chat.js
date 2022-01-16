const activeUsers = new Set();
const jwt = require("jsonwebtoken");
const { Profile } = require("../database/models/Profile");
const { Chat } = require("../database/models/Chat");
const { User } = require("../database/models/User");
const { Message } = require("../database/models/File");
const { uploadFileFromBase64, getSignedUrl } = require("../utils/awsS3");
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
          socket.join(profile.chats[i]);
        }
      });
      socket.on("new message", async function (data) {
        const { messageData, chatId, fileType } = data;
        if (!socket.profileId) {
          throw new Error("Must be logged in");
        }
        const chat = await Chat.find({
          _id: chatId,
          members: socket.profileId,
        });
        if (!chat) {
          throw new Error("Chat not found");
        }
        var fileTypeFixed = fileType.replace("audio/", "");
        const message = new Message({
          owner: socket.profileId,
          fileExtension: fileTypeFixed,
        });
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
          await uploadFileFromBase64(
            messageData,
            `${fileObject._id}${fileTypeFixed}`
          );
          message.signedUrl = await getSignedUrl(
            `${fileObject._id}${fileTypeFixed}`
          );
          await message.save({ session });
          chat.messages.push(message._id);
          await chat.save({ session });
          await session.commitTransaction();
          io.to(chatId).emit("new message", message);
        } catch (err) {
          await session.abortTransaction();
        } finally {
          session.endSession();
        }
      });

      socket.on("disconnect", () => {
        activeUsers.delete(socket.userId);
      });
    } catch (err) {
      // FIXME: Handle socket error
      console.log(err);
    }
  });
};

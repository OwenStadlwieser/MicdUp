const mongoose = require("mongoose");
const { Profile } = require("../../models/Profile");
const { Chat } = require("../../models/Chat");
const { GraphQLString, GraphQLID, GraphQLList } = require("graphql");
const { ChatType } = require("../../types");
const { uploadFileFromBase64, deleteFile } = require("../../../utils/awsS3");

const fetchChat = {
  type: ChatType,
  args: {
    members: { type: new GraphQLList(GraphQLID) },
    owner: { type: GraphQLID },
  },
  async resolve(parent, { members, owner }, context) {
    // FIXME: implement transaction
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      if (!context.user.id) {
        throw new Error("Must be signed in to message");
      }
      let chat = await Chat.findOne({ members });
      if (chat) return chat;
      chat = new Chat({ members, owner });
      for (let i = 0; i < members.length; i++) {
        await Profile.findByIdAndUpdate(
          members[i],
          {
            $push: { chats: chat._id },
          },
          { session }
        );
      }
      await chat.save({ session });
      await session.commitTransaction();
      return chat;
    } catch (err) {
      await session.abortTransaction();
      console.log(err);
    } finally {
      session.endSession();
    }
  },
};

module.exports = {
  fetchChat,
};

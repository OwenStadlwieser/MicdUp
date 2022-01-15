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
    try {
      if (!context.user.id) {
        throw new Error("Must be signed in to message");
      }
      let chat = await Chat.findOne({ members });
      if (chat) return chat;
      chat = new Chat({ members, owner });
      await chat.save();
      return chat;
    } catch (err) {
      console.log(err);
    }
  },
};

module.exports = {
  fetchChat,
};

const mongoose = require("mongoose");
const { Profile } = require("../../models/Profile");
const { Chat } = require("../../models/Chat");
const { Message } = require("../../models/File");
const {
  GraphQLString,
  GraphQLID,
  GraphQLList,
  GraphQLInt,
} = require("graphql");
const { ChatMessageType, ChatType } = require("../../types");

const fetchChatMessages = {
  type: new GraphQLList(ChatMessageType),
  args: {
    skipMult: { type: GraphQLInt },
    chatId: { type: GraphQLID },
  },
  async resolve(parent, { chatId, skipMult }, context) {
    // FIXME: implement transaction
    const size = 20;
    try {
      if (!context.user.id) {
        throw new Error("Must be signed in to message");
      }
      let chat = await Chat.findById(chatId);
      const index = chat.members.findIndex(
        (id) => id.toString() === context.profile.id
      );
      if (index === -1) {
        throw new Error("Must be in chat to view messages");
      }
      const chats = await Message.find({ _id: { $in: chat.messages } })
        .sort({ dateCreated: -1 })
        .skip(size * skipMult)
        .limit(size);
      const reverse = chats.reverse();
      return reverse;
    } catch (err) {
      console.log(err);
    }
  },
};

const fetchChats = {
  type: new GraphQLList(ChatType),
  args: { skipMult: { type: GraphQLInt } },
  async resolve(parent, { skipMult }, context) {
    // FIXME: implement transaction
    const size = 20;
    try {
      if (!context.user.id) {
        throw new Error("Must be signed in to message");
      }
      const chats = await Chat.find({ _id: { $in: context.profile.chats } })
        .sort({ dateCreated: 1 })
        .skip(size * skipMult)
        .limit(size);
      return chats;
    } catch (err) {
      console.log(err);
    }
  },
};

module.exports = {
  fetchChats,
  fetchChatMessages,
};

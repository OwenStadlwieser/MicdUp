const mongoose = require("mongoose");
const graphql = require("graphql");
const { GraphQLString } = graphql;

const { User } = require("../../models/User");
const { Notif } = require("../../models/Notif");
const { NotifType, MessageType } = require("../../types");

const addToken = {
  type: NotifType,
  args: {
    token: { type: GraphQLString },
  },
  async resolve(parent, { token }, context) {
    // check if already liked and unlike
    if (!context.user.id) {
      throw new Error("Must be signed in to add a push token.");
    }
    let index = -1;

    if (await User.exists({ _id: context.user.id, pushTokens: token })) {
      console.log("token already exists in user");
      return;
    }

    if (
      !(await User.updateOne(
        { _id: context.user.id },
        { $push: { pushTokens: token } }
      ))
    ) {
      console.log("updating push token failed.");
    }
  },
};

const markNotifsAsSeen = {
  type: MessageType,
  args: {},
  async resolve(parent, {}, context) {
    // check if already liked and unlike
    if (!context.user.id) {
      throw new Error("Must be signed in to add a push token.");
    }
    let index = -1;

    try {
      await Notif.updateMany(
        {
          receiver: context.user.profile,
        },
        {
          seenByUser: true,
        }
      );
      return {
        success: true,
        message: "notifs seen",
      };
    } catch (err) {
      return {
        success: false,
        message: err.message,
      };
    }
  },
};
module.exports = {
  addToken,
  markNotifsAsSeen,
};

const mongoose = require("mongoose");
const graphql = require("graphql");
const { GraphQLString } = graphql;

const { User } = require("../../models/User");
const { Notif } = require("../../models/Notif");
const { NotifType, MessageType } = require("../../types");

const addToken = {
  type: MessageType,
  args: {
    token: { type: GraphQLString },
  },
  async resolve(parent, { token }, context) {
    // check if already liked and unlike
    if (!context.user.id) {
      return {
        success: false,
        messge: "Must be logged in to register for push",
      };
    }
    let index = -1;

    if (
      await User.exists({ _id: context.user.id, pushTokens: { $all: [token] } })
    ) {
      console.log("token already exists in user");
      return {
        success: false,
        messge: "token already exists",
      };
    }

    if (
      !(await User.findOneAndUpdate(
        { _id: context.user.id, pushTokens: { $nin: [token] } },
        { $push: { pushTokens: token } }
      ))
    ) {
      console.log("fail");
      return {
        success: false,
        messge: "updating token failed exists",
      };
    }
    console.log("success");
    return {
      success: true,
      messge: "updated token",
    };
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
    console.log("marked");
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
      console.log(err);
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

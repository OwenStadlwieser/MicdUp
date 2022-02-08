const mongoose = require("mongoose");
const graphql = require("graphql");
const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema,
  GraphQLList,
  GraphQLBoolean,
  GraphQLFloat,
} = graphql;

const { User } = require("../../models/User");
const { NotifType } = require("../../types");

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

module.exports = {
  addToken,
};

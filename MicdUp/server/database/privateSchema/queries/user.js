const { User } = require("../../models/User");
const { UserPublicType, UserPrivateType } = require("../../types");
const { GraphQLList, GraphQLString, GraphQLInt } = require("graphql");
const { MessageType } = require("../../types");
const bcrypt = require("bcryptjs");

const getUser = {
  type: UserPrivateType,
  args: {},
  async resolve(parent, {}, context) {
    try {
      return context.user;
    } catch (err) {}
  },
};
module.exports = {
  getUser,
};

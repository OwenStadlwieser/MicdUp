const { User } = require("../../models/User");
const { UserType } = require("../../types");
const { GraphQLList, GraphQLString } = require("graphql");
const { MessageType } = require("../../types");
const bcrypt = require("bcryptjs");

const getUser = {
  type: UserType,
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

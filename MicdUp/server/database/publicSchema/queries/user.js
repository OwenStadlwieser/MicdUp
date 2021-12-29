const { User } = require("../../models/User");
const { UserType } = require("../../types");
const { GraphQLList } = require("graphql");
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

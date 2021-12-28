const { User } = require("../../models/User");
const { UserType } = require("../../types");
const { GraphQLList } = require("graphql");
const getUser = {
  type: UserType,
  args: {},
  async resolve(parent, {}, context) {
    try {
      const res = await User.findOne();
      return res;
    } catch (err) {}
  },
};

module.exports = {
  getUser,
};

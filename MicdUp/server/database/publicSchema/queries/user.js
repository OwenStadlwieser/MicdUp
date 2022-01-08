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

const verifyEmailCode = {
  type: MessageType,
  args: {
    verificationCode: { type: GraphQLString },
  },
  async resolve(parent, { verificationCode }, context) {
    const user = await User.findOne({
      verifyEmailToken: verificationCode,
    });
    if (!user) {
      return {
        success: false,
        message: "Email Verification Token not found",
      };
    }
    if (user.verifyEmailCreatedAt + 1000 * 60 * 10 > Date.now()) {
      return {
        success: false,
        message: "Email Verification Token has expired",
      };
    }
    return { success: true, message: "Valid token" };
  },
};

module.exports = {
  getUser,
  verifyEmailCode,
};

const { User } = require("../../models/User");
const { GraphQLString } = require("graphql");
const { MessageType } = require("../../types");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const login = {
  type: MessageType,
  args: {
    authenticator: { type: GraphQLString },
    password: { type: GraphQLString },
  },
  async resolve(parent, { authenticator, password }, context) {
    const user = await User.findOne({
      $or: [
        { userName: authenticator },
        { email: authenticator },
        { phone: authenticator },
      ],
    });
    if (!user) {
      return {
        success: false,
        message: "No user with that identifier",
      };
    }
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return { success: false, message: "Incorrect password" };
    }
    //FIXME: replace secret
    const token = jwt.sign(
      {
        user: user._id,
      },
      "secret",
      // this token will last for a year, this should be adjusted accordingly
      { expiresIn: "1w" }
    );
    // so basically we don't do much here, we only return the token when the user successfully logs in
    return { success: true, message: token };
  },
};

const forgotPassVerify = {
  type: MessageType,
  args: {
    secureCode: { type: GraphQLString },
  },
  async resolve(parent, { secureCode }, context) {
    const user = await User.findOne({
      resetPasswordToken: secureCode,
    });
    if (!user) {
      return {
        success: false,
        message: "Token not found",
      };
    }
    if (user.resetPasswordCreatedAt + 1000 * 60 * 10 > Date.now()) {
      return {
        success: false,
        message: "Token has expired",
      };
    }
    return { success: true, message: "Valid token" };
  },
};

module.exports = {
  login,
  forgotPassVerify,
};

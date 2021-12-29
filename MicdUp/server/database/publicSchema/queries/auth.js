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

module.exports = {
  login,
};

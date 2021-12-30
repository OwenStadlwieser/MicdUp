const { User } = require("../../models/User");
const { GraphQLString } = require("graphql");
const { MessageType } = require("../../types");
const bcrypt = require("bcryptjs");
const createUser = {
  type: MessageType,
  args: {
    email: { type: GraphQLString },
    phone: { type: GraphQLString },
    user: { type: GraphQLString },
    password: { type: GraphQLString },
    dob: { type: GraphQLString },
  },
  async resolve(parent, { email, phone, password, user, dob }, context) {
    // FIXME: implement transaction
    returnObject = {
      success: true,
      message: "Sign up successful",
    };
    try {
      await User.create({
        userName: user,
        phone,
        email,
        password,
        dob,
      });
    } catch (err) {
      returnObject.success = false;
      returnObject.message = err.message;
    }
    return returnObject;
  },
};

const forgotPassChange = {
  type: MessageType,
  args: {
    secureCode: { type: GraphQLString },
    newPass: { type: GraphQLString },
  },
  async resolve(parent, { secureCode, newPass }, context) {
    // FIXME: implement transaction
    let returnObject = {
      success: true,
      message: "Password Reset Successful",
    };
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
    const isValid = await bcrypt.compare(newPass, user.password);
    if (isValid) {
      return { success: false, message: "Please input new password" };
    }
    user.password = newPass;
    await user.save();
    return returnObject;
  },
};

module.exports = {
  createUser,
  forgotPassChange,
};

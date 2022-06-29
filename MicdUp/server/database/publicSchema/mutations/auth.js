const mongoose = require("mongoose");
const { User } = require("../../models/User");
const { Profile } = require("../../models/Profile");
const { GraphQLString } = require("graphql");
const { MessageType } = require("../../types");
const bcrypt = require("bcryptjs");
const { getCurrentTime } = require("../../../reusableFunctions/helpers");

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
      message: "Sign up successful, Verify Email to continue",
    };
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const newUser = new User({
        userName: user,
        phone,
        email,
        password,
        dob,
        dateCreated: getCurrentTime(),
      });
      const newProfile = new Profile({});
      newUser.profile = newProfile._id;
      newProfile.user = newUser._id;
      await newUser.save({ session });
      await newProfile.save({ session });
      await session.commitTransaction();
    } catch (err) {
      returnObject.success = false;
      returnObject.message = err.message;
      await session.abortTransaction();
    } finally {
      session.endSession();
    }
    return returnObject;
  },
};

const forgotPassChange = {
  type: MessageType,
  args: {
    secureCode: { type: GraphQLString },
    newPass: { type: GraphQLString },
    email: { type: GraphQLString },
  },
  async resolve(parent, { secureCode, newPass, email }, context) {
    // FIXME: implement transaction
    let returnObject = {
      success: true,
      message: "Password Reset Successful",
    };
    const user = await User.findOne({
      email,
      emailVerified: true,
    });
    if (!user || !user.resetPasswordToken) {
      return {
        success: false,
        message: "User not found",
      };
    }
    const isValidToken = await bcrypt.compare(
      secureCode,
      user.resetPasswordToken
    );
    if (!isValidToken) {
      return {
        success: false,
        message: "Invalid code",
      };
    }
    if (user.resetPasswordCreatedAt + 1000 * 60 * 10 > getCurrentTime()) {
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
    user.resetPasswordToken = null;
    await user.save();
    return returnObject;
  },
};

module.exports = {
  createUser,
  forgotPassChange,
};

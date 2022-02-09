const mongoose = require("mongoose");
const { User } = require("../../models/User");
const { Profile } = require("../../models/Profile");
const { Post } = require("../../models/Post");
const { GraphQLString } = require("graphql");
const { MessageType } = require("../../types");
const { sendEmail } = require("../../../utils/sendEmail");
const bcrypt = require("bcryptjs");
const forgotPass = {
  type: MessageType,
  args: {
    email: { type: GraphQLString },
  },
  async resolve(parent, { email }, context) {
    // FIXME: implement transaction
    let returnObject = {
      success: true,
      message: "Email sent successfully",
    };
    const user = await User.findOne({ email });
    if (!user) {
      returnObject.success = false;
      returnObject.message = "No user found";
      return returnObject;
    }
    if (!user.emailVerified) {
      returnObject.success = false;
      returnObject.message = "Email has not been verified";
      return returnObject;
    }
    const resetToken = await user.getPasswordResetToken();
    const message = `You are receiving this message because you have requested to
    reset your password. The code to reset your password is ${resetToken}.`;
    user.resetPasswordToken = await bcrypt.hash(resetToken, 12);
    await user.save();
    try {
      await sendEmail({
        email: user.email,
        subject: "MicdUp Password Reset Requested",
        message,
      });
    } catch (err) {
      console.log(err);
      returnObject.success = false;
      returnObject.message = err.message;
    }
    return returnObject;
  },
};

module.exports = {
  forgotPass,
};

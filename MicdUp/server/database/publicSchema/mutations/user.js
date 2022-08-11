const { User } = require("../../models/User");
const { GraphQLString } = require("graphql");
const { MessageType } = require("../../types");
const { sendEmail } = require("../../../utils/sendEmail");
const bcrypt = require("bcryptjs");
const { getCurrentTime } = require("../../../reusableFunctions/helpers");
const verifyEmail = {
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
    const emailToken = await user.getVerifiedEmailToken();
    const message = `You are receiving this message because you are trying to verify your email. 
    Your email verification code is ${emailToken}.`;
    user.verifyEmailToken = await bcrypt.hash(emailToken, 12);
    await user.save();
    try {
      await sendEmail({
        email: user.email,
        subject: "MicdUp Email Verification",
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

const setEmailVerified = {
  type: MessageType,
  args: {
    verificationCode: { type: GraphQLString },
    email: { type: GraphQLString },
  },
  async resolve(parent, { verificationCode, email }, context) {
    // FIXME: implement transaction
    let returnObject = {
      success: true,
      message: "Email Verification Successful",
    };
    const user = await User.findOne({
      email,
    });
    if (!user || !user.verifyEmailToken) {
      return {
        success: false,
        message: "User not found",
      };
    }
    const isValidToken = await bcrypt.compare(
      verificationCode,
      user.verifyEmailToken
    );
    if (!isValidToken) {
      return {
        success: false,
        message: "Invalid code",
      };
    }
    if (user.verifyEmailCreatedAt + 1000 * 60 * 10 > getCurrentTime()) {
      return {
        success: false,
        message: "Email Verification Token has expired",
      };
    }
    user.emailVerified = true;
    delete user.verifyEmailToken;
    await user.save();
    return returnObject;
  },
};

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
  verifyEmail,
  setEmailVerified,
  forgotPass,
};

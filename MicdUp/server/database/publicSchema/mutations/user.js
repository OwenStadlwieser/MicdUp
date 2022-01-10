const mongoose = require("mongoose");
const { User } = require("../../models/User");
const { Profile } = require("../../models/Profile");
const { Post } = require("../../models/Post");
const { GraphQLString } = require("graphql");
const { MessageType } = require("../../types");
const { sendEmail } = require("../../../utils/sendEmail");

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
    const resetToken = await user.getPasswordResetToken();
    await user.save();
    const message = `You are receiving this message because you have requested to
    reset your password. The code to reset your password is ${resetToken}.`;
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
    await user.save();
    const message = `You are receiving this message because you are trying to verify your email. 
    Your email verification code is ${emailToken}.`;
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
  },
  async resolve(parent, { verificationCode }, context) {
    // FIXME: implement transaction
    let returnObject = {
      success: true,
      message: "Email Verification Successful",
    };
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
    user.emailVerified = true;
    delete user.verifyEmailToken;
    await user.save();
    return returnObject;
  },
};

const deleteAccount = {
  type: MessageType,
  args: {},
  async resolve(parent, {}, context) {
    // FIXME: implement transaction
    const session = await mongoose.startSession();
    session.startTransaction();
    returnObject = {
      success: true,
      message: "Delete account successfully",
    };
    try {
      // For each person that you are following, unfollow them
      for (let i = 0; i < context.profile.following.length; i++) {
        const followingProfile = Profile.findById(context.profile.following[i]);
        const index = followingProfile.followers.findIndex((id) => {
          return id.toString() === context.profile.id;
        });
        // const index = followingProfile.followers[context.profile.id];
        if (index > -1) {
          followingProfile.followers.splice(index, 1);
          await followingProfile.save({ session });
        }
      }

      //For each of your followers, have them unfollow you
      for (let i = 0; i < context.profile.followers.length; i++) {
        const followerProfile = Profile.findById(context.profile.followers[i]);
        const index = followingProfile.followers.findIndex((id) => {
          return id.toString() === context.profile.id;
        });
        if (index > -1) {
          followerProfile.following.splice(index, 1);
          await followerProfile.save({ session });
        }
      }
      // TODO: Force user to confirm delete account.
      await Post.findByIdAndDelete(context.profile.id);
      await User.findByIdAndDelete(context.user.id);
      await Profile.findByIdAndDelete(context.profile.id);
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

module.exports = {
  forgotPass,
  verifyEmail,
  setEmailVerified,
  deleteAccount,
};

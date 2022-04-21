const mongoose = require("mongoose");
const { User } = require("../../models/User");
const { Profile } = require("../../models/Profile");
const { Post } = require("../../models/Post");
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
    if (context.user.id !== user._id.toString()) {
      return {
        success: false,
        message: "User not logged in",
      };
    }
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
    user.verifyEmailToken = null;
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
      let keys = Array.from(context.profile.following.keys());
      for (let i = 0; i < keys.length; i++) {
        const followingProfile = Profile.findById(keys[i]);
        followingProfile.followers.delete(context.profile.id);
        await followingProfile.save({ session });
      }

      //For each of your followers, have them unfollow you
      keys = Array.from(context.profile.followers.keys());
      for (let i = 0; i < keys.length; i++) {
        const followerProfile = Profile.findById(keys[i]);
        followerProfile.following.delete(context.profile.id);
        await followerProfile.save({ session });
      }
      // TODO: Force user to confirm delete account.
      await Post.findByIdAndDelete({ owner: context.profile.id }, { session });
      await User.findByIdAndDelete(context.user.id, { session });
      await Profile.findByIdAndDelete(context.profile.id, { session });
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
  verifyEmail,
  setEmailVerified,
  deleteAccount,
};

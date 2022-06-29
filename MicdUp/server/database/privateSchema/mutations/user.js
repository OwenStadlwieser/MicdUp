const mongoose = require("mongoose");
const { User } = require("../../models/User");
const { Profile } = require("../../models/Profile");
const { Post } = require("../../models/Post");
const { GraphQLString, GraphQLID, GraphQLBoolean } = require("graphql");
const { MessageType } = require("../../types");
const { sendEmail } = require("../../../utils/sendEmail");
const bcrypt = require("bcryptjs");
const { getCurrentTime } = require("../../../reusableFunctions/helpers");

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
  deleteAccount,
};

const mongoose = require("mongoose");
const { Profile } = require("../../models/Profile");
const { File } = require("../../models/File");
const { GraphQLString, GraphQLID } = require("graphql");
const { FileType, ProfileType, MessageType } = require("../../types");
const { uploadFileFromBase64, deleteFile } = require("../../../utils/awsS3");

const updateProfilePic = {
  type: FileType,
  args: {
    file: { type: GraphQLString },
    fileType: { type: GraphQLString },
  },
  async resolve(parent, { file, fileType }, context) {
    // FIXME: implement transaction
    if (!context.user.id) {
      throw new Error("Must be signed in to post");
    }
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const profile = context.profile;
      if (profile.image) {
        const oldImage = await File.findByIdAndDelete(profile.image, {
          session,
        });
        if (oldImage) {
          await deleteFile(`${oldImage._id}${oldImage.fileExtension}`);
        }
        profile.image = null;
      }
      const fileObject = new File({
        owner: context.profile.id,
        fileExtension: fileType,
      });
      await uploadFileFromBase64(file, `${fileObject._id}${fileType}`);
      profile.image = fileObject._id;
      await fileObject.save({ session });
      await profile.save({ session });
      await session.commitTransaction();
      return fileObject;
    } catch (err) {
      await session.abortTransaction();
      console.log(err);
    } finally {
      session.endSession();
    }
  },
};

const followProfile = {
  type: ProfileType,
  args: {
    profileId: { type: GraphQLID },
  },
  async resolve(parent, { profileId }, context) {
    // FIXME: implement transaction
    if (!context.user.id) {
      throw new Error("Must be signed in to follow");
    }
    if (profileId.toString() === context.profile.id) {
      throw new Error("Cannot follow yourself");
    }
    let returnObject = {};
    const session = await mongoose.startSession();
    session.startTransaction();
    console.log("here");
    try {
      const profile = context.profile;
      const foreignProfile = await Profile.findById(profileId);
      if (foreignProfile.followers.get(`${profile._id}`)) {
        foreignProfile.followers.delete(`${profile._id}`);
        profile.following.delete(`${foreignProfile._id}`);
        returnObject = { message: "unfollowed", success: true };
      } else {
        foreignProfile.followers.set(`${profile._id}`, "1");
        profile.following.set(`${foreignProfile._id}`, "1");
        returnObject = { message: "followed", success: true };
      }
      await profile.save({ session });
      await foreignProfile.save({ session });
      await session.commitTransaction();
      return foreignProfile;
    } catch (err) {
      await session.abortTransaction();
      console.log(err);
      return { message: "Not Followed", success: false };
    } finally {
      session.endSession();
    }
  },
};

module.exports = {
  updateProfilePic,
  followProfile,
};

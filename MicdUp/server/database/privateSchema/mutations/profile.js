const mongoose = require("mongoose");
const { Profile } = require("../../models/Profile");
const { Tag } = require("../../models/Tag");
const { File } = require("../../models/File");
const { GraphQLString, GraphQLID, GraphQLBoolean } = require("graphql");
const {
  FileType,
  ProfilePublicType,
  TagsType,
  MessageType,
} = require("../../types");
const { uploadFileFromBase64, deleteFile } = require("../../../utils/awsS3");
const { getCurrentTime } = require("../../../reusableFunctions/helpers");
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
        dateCreated: getCurrentTime(),
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
  type: ProfilePublicType,
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
    try {
      const profile = context.profile;
      const foreignProfile = await Profile.findOne({
        _id: profileId,
        $not: { blockedBy: { $all: [context.profile.id] } },
      });
      if (!foreignProfile) {
        throw new Error("No owner");
      }
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

const followTopic = {
  type: TagsType,
  args: {
    tagId: { type: GraphQLID },
  },
  async resolve(parent, { tagId }, context) {
    // FIXME: implement transaction
    if (!context.user.id) {
      throw new Error("Must be signed in to follow");
    }

    let returnObject = {};
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const profile = context.profile;
      const foreignTag = await Tag.findById(tagId);
      if (foreignTag.followers.get(`${profile._id}`)) {
        foreignTag.followers.delete(`${profile._id}`);
        profile.followingTopics.delete(`${foreignTag._id}`);
      } else {
        foreignTag.followers.set(`${profile._id}`, "1");
        profile.followingTopics.set(`${foreignTag._id}`, "1");
        returnObject = { message: "followed", success: true };
      }
      await profile.save({ session });
      await foreignTag.save({ session });
      await session.commitTransaction();
      console.log(foreignTag);
      return foreignTag;
    } catch (err) {
      await session.abortTransaction();
      console.log(err);
      return { message: "Not Followed", success: false };
    } finally {
      session.endSession();
    }
  },
};

const blockProfile = {
  type: MessageType,
  args: {
    profileId: { type: GraphQLID },
    blocking: { type: GraphQLBoolean },
  },
  async resolve(parent, { profileId, blocking }, context) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const profile = context.profile;
      let returnObject = {};
      if (profile.id === profileId.toString()) {
        returnObject.success = false;
        returnObject.message = "Cannot block self";
      }
      if (blocking) {
        profile.blockedMap.set(`${profileId}`, "1");
        profile.following.delete(`${profileId}`);
        profile.privates.delete(`${profileId}`);
        const foreignProfile = await Profile.findById(profileId);
        foreignProfile.blockedByMap.set(`${profile.id}`, "1");
        foreignProfile.followers.delete(`${profile.id}`);
        foreignProfile.following.delete(`${profile.id}`);
        foreignProfile.privates.delete(`${profile.id}`);
        await profile.save({ session });
        await foreignProfile.save({ session });
        returnObject.success = true;
        returnObject.message = "Blocked";
      } else {
        foreignProfile.delete.set(`${profile.id}`);
        profile.blockedMap.delete(`${profileId}`);
        await profile.save();
        returnObject.success = true;
        returnObject.message = "Unblocked";
      }
      await session.commitTransaction();
      return returnObject;
    } catch (err) {
      await session.abortTransaction();
    }
    session.endSession();
  },
};

const addToPrivates = {
  type: ProfilePublicType,
  args: {
    profileId: { type: GraphQLID },
  },
  async resolve(parent, { profileId }, context) {
    // FIXME: implement transaction
    if (!context.user.id) {
      throw new Error("Must be signed in to add to privates");
    }
    if (profileId.toString() === context.profile.id) {
      throw new Error("Cannot add yourself to privates");
    }
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const profile = context.profile;
      const foreignProfile = await Profile.findById(profileId);
      if (profile.privates.get(`${profileId}`)) {
        profile.privates.delete(`${profileId}`);
      } else {
        profile.privates.set(`${profileId}`, "1");
      }
      await profile.save({ session });
      await session.commitTransaction();
      return foreignProfile;
    } catch (err) {
      await session.abortTransaction();
      console.log(err);
      return {};
    } finally {
      session.endSession();
    }
  },
};

module.exports = {
  updateProfilePic,
  followProfile,
  addToPrivates,
  followTopic,
  blockProfile,
};

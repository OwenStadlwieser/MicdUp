const mongoose = require("mongoose");
const { Profile } = require("../../models/Profile");
const { File } = require("../../models/File");
const { GraphQLString } = require("graphql");
const { FileType } = require("../../types");
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

module.exports = {
  updateProfilePic,
};

var ffmpeg = require("fluent-ffmpeg");
const { PostType } = require("../../types");
const fs = require("fs");
const graphql = require("graphql");
var path = require("path");
const ffmpegStatic = require("ffmpeg-static");
const ffprobeStatic = require("ffprobe-static");
const { uploadFile } = require("../../../utils/awsS3");
const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema,
  GraphQLList,
  GraphQLBoolean,
  GraphQLFloat,
} = graphql;
const { Post } = require("../../models/Post");
const mongoose = require("mongoose");
ffmpeg.setFfmpegPath(ffmpegStatic);
ffmpeg.setFfprobePath(ffprobeStatic.path);

const createRecording = {
  type: PostType,
  args: {
    files: { type: new GraphQLList(GraphQLString) },
    fileTypes: { type: new GraphQLList(GraphQLString) },
    nsfw: { type: GraphQLBoolean },
    allowRebuttal: { type: GraphQLBoolean },
    allowStitch: { type: GraphQLBoolean },
    privatePost: { type: GraphQLBoolean },
  },
  async resolve(
    parent,
    { files, fileTypes, nsfw, allowRebuttal, allowStitch, privatePost },
    context
  ) {
    // FIXME: implement transaction
    var command = ffmpeg();
    if (!context.user.id) {
      throw new Error("Must be signed in to post");
    }
    const fileNames = [];
    try {
      for (let i = 0; i < files.length; i++) {
        var fileType = fileTypes[i].replace("audio/", "");
        var jsonPath = path.join(
          __dirname,
          "..",
          "..",
          "..",
          "temp",
          `${i}.${fileType}`
        );
        const base64 = files[i].substr(files[i].indexOf(",") + 1);
        // const byteArray = base64ToArrayBuffer(base64);
        fs.writeFileSync(jsonPath, base64, "base64", function (err) {
          if (err) throw err;
          console.log("File is created successfully.");
        });
        fileNames.push(jsonPath);
        command.input(jsonPath).inputFormat(fileType);
      }
    } catch (err) {
      console.log(err);
    }
    var jsonPath = path.join(__dirname, "..", "..", "..", "temp");
    const fileName = path.join(
      __dirname,
      "..",
      "..",
      "..",
      "temp",
      "merged.mp4"
    );
    const session = await mongoose.startSession();
    session.startTransaction();
    command
      .on("error", function (err) {
        console.log(err);
        console.log("An error occurred: " + err.message);
      })
      .on("end", async function () {
        try {
          for (let i = 0; i < fileNames.length; i++) {
            fs.unlink(fileNames[i], function (err) {
              if (err) throw err;
            });
          }
          const post = new Post({
            owner: context.user.id,
            nsfw,
            allowRebuttal,
            allowStitch,
            privatePost,
            fileExtension: ".mp4",
          });
          await post.save({ session });
          await uploadFile(fileName, `${post._id}.mp4`);
          fs.unlink(fileName, function (err) {
            if (err) throw err;
          });
          await session.commitTransaction();
          fs.unlink(fileName, function (err) {
            if (err) throw err;
          });
          return post;
        } catch (err) {
          console.log(err);
          await session.abortTransaction();
        } finally {
          session.endSession();
        }
      })
      .mergeToFile(fileName);
  },
};

module.exports = {
  createRecording,
};

var ffmpeg = require("fluent-ffmpeg");
const { PostType } = require("../../types");
const fs = require("fs");
const graphql = require("graphql");
var path = require("path");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffprobePath = require("node-ffprobe-installer").path;
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
const { Tag } = require("../../models/Tag");
const mongoose = require("mongoose");
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

const createRecording = {
  type: PostType,
  args: {
    files: { type: new GraphQLList(GraphQLString) },
    fileTypes: { type: new GraphQLList(GraphQLString) },
    tags: { type: new GraphQLList(GraphQLString) },
    nsfw: { type: GraphQLBoolean },
    allowRebuttal: { type: GraphQLBoolean },
    allowStitch: { type: GraphQLBoolean },
    privatePost: { type: GraphQLBoolean },
  },
  async resolve(
    parent,
    { files, fileTypes, nsfw, allowRebuttal, allowStitch, privatePost, tags },
    context
  ) {
    console.log(tags);
    var command = ffmpeg();
    // check if logged in
    if (!context.user.id) {
      throw new Error("Must be signed in to post");
    }
    const fileNames = [];
    // prep files for combine
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
    // create post record
    const post = new Post({
      owner: context.profile.id,
      nsfw,
      allowRebuttal,
      allowStitch,
      privatePost,
      fileExtension: ".mp4",
    });
    var jsonPath = path.join(__dirname, "..", "..", "..", "temp");
    const fileName = path.join(
      __dirname,
      "..",
      "..",
      "..",
      "temp",
      `${post._id}.mp4`
    );
    // combine files
    command
      .on("error", function (err) {
        console.log(err);
        console.log("An error occurred: " + err.message);
      })
      .on("end", async function () {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
          for (let i = 0; i < fileNames.length; i++) {
            fs.unlink(fileNames[i], function (err) {
              if (err) throw err;
            });
          }
          // upload file
          await uploadFile(fileName, `${post._id}.mp4`);
          // attach tags to post
          for (let i = 0; i < tags.length; i++) {
            if (!tags[i]) continue;
            let tag = await Tag.findOne({ title: tags[i] });
            if (!tag) {
              tag = new Tag({ title: tags[i] });
            }
            tag.count = tag.count + 1;
            tag.posts.push(post._id);
            post.tags.push(tag._id);
            await tag.save({ session });
          }
          await post.save({ session });
          await session.commitTransaction();
          return post;
        } catch (err) {
          console.log(err);
          await session.abortTransaction();
        } finally {
          fs.unlink(fileName, function (err) {
            if (err) throw err;
          });
          session.endSession();
        }
      })
      .mergeToFile(fileName);
  },
};

module.exports = {
  createRecording,
};

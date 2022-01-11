var ffmpeg = require("fluent-ffmpeg");
const { PostType, FileType, CommentType, MessageType } = require("../../types");
const fs = require("fs");
const graphql = require("graphql");
var path = require("path");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffprobePath = require("node-ffprobe-installer").path;
const {
  uploadFile,
  deleteFile,
  uploadFileFromBase64,
} = require("../../../utils/awsS3");
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
const { Profile } = require("../../models/Profile");
const { File } = require("../../models/File");
const { Tag } = require("../../models/Tag");
const { Comment } = require("../../models/Comment");
const mongoose = require("mongoose");
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

const createRecording = {
  type: PostType,
  args: {
    files: { type: new GraphQLList(GraphQLString) },
    fileTypes: { type: new GraphQLList(GraphQLString) },
    tags: { type: new GraphQLList(GraphQLString) },
    title: { type: GraphQLString },
    nsfw: { type: GraphQLBoolean },
    allowRebuttal: { type: GraphQLBoolean },
    allowStitch: { type: GraphQLBoolean },
    privatePost: { type: GraphQLBoolean },
  },
  async resolve(
    parent,
    {
      files,
      fileTypes,
      title,
      nsfw,
      allowRebuttal,
      allowStitch,
      privatePost,
      tags,
    },
    context
  ) {
    var command = ffmpeg();
    // check if logged in
    if (!context.user.id) {
      throw new Error("Must be signed in to post");
    }
    const fileNames = [];
    // create post record
    const post = new Post({
      owner: context.profile.id,
      nsfw,
      title,
      allowRebuttal,
      allowStitch,
      privatePost,
      fileExtension: ".mp4",
    });
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
          `${post._id}${i}.${fileType}`
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
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      await ffmpegMergeAndUpload(fileName, post._id, fileNames, command);
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
      await session.abortTransaction();
      console.log(err);
    } finally {
      fs.unlink(fileName, function (err) {
        if (err) throw err;
      });
      session.endSession();
    }
  },
};

const uploadBio = {
  type: FileType,
  args: {
    files: { type: GraphQLString },
    fileTypes: { type: GraphQLString },
  },
  async resolve(parent, { files, fileTypes }, context) {
    var command = ffmpeg();
    // check if logged in
    if (!context.user.id) {
      throw new Error("Must be signed in to post");
    }
    const fileNames = [];
    // prep files for combine
    const bio = new File({
      owner: context.profile.id,
      fileExtension: ".mp4",
    });
    try {
      var fileType = fileTypes.replace("audio/", "");
      var jsonPath = path.join(
        __dirname,
        "..",
        "..",
        "..",
        "temp",
        `${bio._id}.${fileType}`
      );
      const base64 = files.substr(files.indexOf(",") + 1);
      fs.writeFileSync(jsonPath, base64, "base64", function (err) {
        if (err) throw err;
        console.log("File is created successfully.");
      });
      fileNames.push(jsonPath);
      command.input(jsonPath).inputFormat(fileType);
    } catch (err) {
      console.log(err);
    }
    // create post record
    const profile = context.profile;
    if (profile.bio) {
      const oldBio = await File.findByIdAndDelete(profile.bio, { session });
      if (oldBio) {
        await deleteFile(`${oldBio._id}${oldBio.fileExtension}`);
      }
      profile.bio = null;
    }
    profile.bio = bio._id;
    var jsonPath = path.join(__dirname, "..", "..", "..", "temp");
    const fileName = path.join(
      __dirname,
      "..",
      "..",
      "..",
      "temp",
      `${bio._id}.mp4`
    );
    // convert file to mp4 (might as well keep them all the same)
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      await ffmpegMergeAndUpload(fileName, bio._id, fileNames, command);
      await profile.save({ session });
      await bio.save({ session });
      await session.commitTransaction();
      return bio;
    } catch (err) {
      await session.abortTransaction();
      console.log(err);
    } finally {
      fs.unlink(fileName, function (err) {
        if (err) throw err;
      });
      session.endSession();
    }
  },
};

const likePost = {
  type: PostType,
  args: {
    postId: { type: GraphQLID },
  },
  async resolve(parent, { postId }, context) {
    // check if already liked and unlike
    if (!context.user.id) {
      throw new Error("Must be signed in to post");
    }
    let index = -1;
    const post = await Post.findOne({
      _id: postId,
    }).then((post) => {
      index = post.likers.findIndex(
        (id) => id.toString() === context.profile.id
      );
      return post;
    });
    if (post && index < 0) {
      post.likers.push(context.profile._id);
      await post.save();
      return post;
    }
    if (post && index > -1) {
      post.likers.splice(index, 1);
      await post.save();
      return post;
    }
  },
};

const likeComment = {
  type: CommentType,
  args: {
    commentId: { type: GraphQLID },
  },
  async resolve(parent, { commentId }, context) {
    // check if already liked and unlike
    if (!context.user.id) {
      throw new Error("Must be signed in to like comment");
    }
    let index = -1;
    const comment = await Comment.findOne({
      _id: commentId,
    }).then((comment) => {
      index = comment.likers.findIndex(
        (id) => id.toString() === context.profile.id
      );
      return comment;
    });
    if (comment && index < 0) {
      comment.likers.push(context.profile._id);
      await comment.save();
      return comment;
    }
    if (comment && index > -1) {
      comment.likers.splice(index, 1);
      await comment.save();
      return comment;
    }
  },
};

const deletePost = {
  type: MessageType,
  args: {
    postId: { type: GraphQLID },
  },
  async resolve(parent, { postId }, context) {
    const session = await mongoose.startSession();
    session.startTransaction();
    returnObject = {
      success: true,
      message: "Delete post successful.",
    };
    try {
      // Delete every comment to this post
      const post = await Post.findOne({
        _id: postId,
      });
      if (!context.profile || post.owner.toString() !== context.profile.id) {
        throw new Error("You are not authorized to delete this post");
      }
      if (!post) {
        throw new Error("post not found");
      }
      for (let i = 0; i < post.comments.length; i++) {
        await Comment.findByIdAndDelete({ _id: post.comments[i] });
      }
      await post.save({ session });
      await Post.findByIdAndDelete(postId);
      await session.commitTransaction();
    } catch (err) {
      returnObject.success = false;
      returnObject.message = err.message;
      await session.abortTransaction();
    } finally {
      session.endSession();
    }
    console.log("Delete post successful.");
    return returnObject;
  },
};

const commentToPost = {
  type: CommentType,
  args: {
    postId: { type: GraphQLID },
    replyingTo: { type: GraphQLID },
    files: { type: GraphQLString },
    fileTypes: { type: GraphQLString },
    text: { type: GraphQLString },
  },
  async resolve(
    parent,
    { postId, replyingTo, files, fileTypes, text },
    context
  ) {
    // check if already liked and unlike
    if (!context.user.id) {
      throw new Error("Must be signed in to post");
    }
    let comment;
    if (text) {
      comment = new Comment({ owner: context.profile.id, text });
    } else {
      var fileType = fileTypes.replace("audio/", "");
      comment = new Comment({
        owner: context.profile.id,
        fileExtension: ".mp4",
      });
      var fileNames = [];
      var command = ffmpeg();
      try {
        var jsonPath = path.join(
          __dirname,
          "..",
          "..",
          "..",
          "temp",
          `${comment._id}.${fileType}`
        );
        const base64 = files.substr(files.indexOf(",") + 1);
        fs.writeFileSync(jsonPath, base64, "base64", function (err) {
          if (err) throw err;
          console.log("File is created successfully.");
        });
        fileNames.push(jsonPath);
        command.input(jsonPath).inputFormat(fileType);
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
        `${comment._id}.mp4`
      );
      await ffmpegMergeAndUpload(fileName, comment._id, fileNames, command);
      fs.unlink(fileName, function (err) {
        if (err) throw err;
      });
    }
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      if (replyingTo) {
        let ultimateParent;
        const commentParent = await Comment.findOne({
          _id: replyingTo,
        });
        if (!commentParent) {
          throw new Error("post not found");
        }
        commentParent.replies.push(comment._id);
        if (commentParent.isTop) {
          comment.ultimateParent = commentParent._id;
        } else {
          comment.ultimateParent = commentParent.ultimateParent;
        }
        comment.parent = commentParent._id;
        await comment.save({ session });
        await commentParent.save({ session });
        await session.commitTransaction();
        return commentParent;
      } else {
        const post = await Post.findOne({
          _id: postId,
        });
        if (!post) {
          throw new Error("post not found");
        }
        post.comments.push(comment._id);
        comment.isTop = true;
        await comment.save({ session });
        await post.save({ session });
        await session.commitTransaction();
        return comment;
      }
    } catch (err) {
      await session.abortTransaction();
      console.log(err);
    } finally {
      session.endSession();
    }
  },
};

const ffmpegMergeAndUpload = async (fileName, id, fileNames, command) => {
  await new Promise((resolve, reject) => {
    command
      .on("error", function (err) {
        console.log(err);
        console.log("An error occurred: " + err.message);
        return reject(new Error(err));
        throw err;
      })
      .on("end", async function () {
        try {
          for (let i = 0; i < fileNames.length; i++) {
            fs.unlink(fileNames[i], function (err) {
              if (err) throw err;
            });
          }
          // upload file
          await uploadFile(fileName, `${id}.mp4`);
          resolve();
        } catch (err) {
          throw err;
          return reject(new Error(err));
        }
      })
      .mergeToFile(fileName);
  });
};
module.exports = {
  createRecording,
  uploadBio,
  likePost,
  likeComment,
  deletePost,
  deleteComment,
  commentToPost,
};

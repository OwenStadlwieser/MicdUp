const { User } = require("../../models/User");
const { Comment } = require("../../models/Comment");
const { Post } = require("../../models/Post");
const mongoose = require("mongoose");
const { makeLikeNotification } = require("../../../utils/sendNotification");
const graphql = require("graphql");
const { GraphQLID } = graphql;
const { CommentType } = require("../../types");
const {
  makeNotification,
  deleteNotification,
} = require("../../../utils/sendNotification");
const { NotificationTypesBackend } = require("../../../utils/constants");

const deleteComment = {
  type: CommentType,
  args: {
    commentId: { type: GraphQLID },
  },
  async resolve(parent, { commentId }, context) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      // Delete every comment to this post
      const comment = await Comment.findOne({
        _id: commentId,
      });
      const post = await Post.findById(comment.post);
      if (
        !context.profile ||
        (comment.owner.toString() !== context.profile.id &&
          post.owner.toString() !== context.profile.id)
      ) {
        throw new Error("You are not authorized to delete this comment");
      }
      if (!comment) {
        throw new Error("post not found");
      }
      await deleteNotification(
        context.profile.user,
        post.owner,
        comment._id,
        comment.isTop
          ? NotificationTypesBackend.CommentPost
          : NotificationTypesBackend.ReplyComment
      );
      comment.isDeleted = true;
      await comment.save({ session });
      await session.commitTransaction();
      return comment;
    } catch (err) {
      console.log(err);
      await session.abortTransaction();
    } finally {
      session.endSession();
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
      const post = await Post.findById(comment.post);
      await makeNotification(
        await User.findOne(context.profile.user),
        NotificationTypesBackend.LikeComment,
        {},
        comment.owner,
        LIKE_MESSAGE + " " + post.title,
        comment._id,
        comment.post
      );
      return comment;
    }
    if (comment && index > -1) {
      comment.likers.splice(index, 1);
      await comment.save();
      await deleteNotification(
        context.profile.user,
        comment.owner,
        comment._id,
        NotificationTypesBackend.LikeComment
      );
      // makeLikeNotification(await User.findOne(context.profile.user),"comment",{},comment.owner);
      return comment;
    }
  },
};

module.exports = {
  likeComment,
  deleteComment,
};

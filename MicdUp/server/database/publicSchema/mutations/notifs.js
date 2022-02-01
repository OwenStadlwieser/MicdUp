



const mongoose = require("mongoose");
const graphql = require("graphql");
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

const { Notif } = require("../../models/Notif");
const {NotifType} = require("../../types");


const likeComment = {
  type: NotifType,
  args: {
    userId: { type: GraphQLID },
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

module.exports = {
  likeComment,
  deleteComment,
};

const { CommentType } = require("../../types");
const fs = require("fs");
const graphql = require("graphql");
var path = require("path");
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
const { Comment } = require("../../models/Comment");

const getReplies = {
  type: CommentType,
  args: { commentId: { type: GraphQLID } },
  async resolve(parent, { commentId }, context) {
    try {
      let blockedBy = [];
      let blocked = [];
      if (context.profile) {
        blocked = [...context.profile.blockedMap.keys()];
        blockedBy = [...context.profile.blockedByMap.keys()];
      }
      return await Comment.find({
        $and: [
          { _id: commentId },
          { owner: { $nin: blocked } },
          { owner: { $nin: blockedBy } },
        ],
      });
    } catch (err) {}
  },
};

module.exports = {
  getReplies,
};

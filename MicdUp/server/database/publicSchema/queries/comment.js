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
      return await Comment.findById(commentId);
    } catch (err) {}
  },
};

module.exports = {
  getReplies,
};

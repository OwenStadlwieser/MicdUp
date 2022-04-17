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
const { PostType, PromptsType } = require("../../types");
const { Post } = require("../../models/Post");
const { File } = require("../../models/File");
const { Tag } = require("../../models/Tag");
const { Comment } = require("../../models/Comment");
const { User } = require("../../models/User");
const { Profile } = require("../../models/Profile");
const mongoose = require("mongoose");

const getFollowingFeed = {
  type: new GraphQLList(PostType),
  args: { skipMult: { type: GraphQLInt } },
  async resolve(parent, { skipMult }, context) {
    try {
      const size = 20;
      if (
        !context.user ||
        !context.profile.following ||
        !(context.profile.following instanceof Map)
      ) {
        return;
      }
      let following = context.profile.following.keys();
      return await Post.find({
        owner: { $in: Array.from(following) },
      })
        .sort({ dateCreated: -1 })
        .skip(size * skipMult)
        .limit(size);
    } catch (err) {
      console.log(err);
    }
  },
};

const getFollowingTopicsFeed = {
  type: new GraphQLList(PostType),
  args: { skipMult: { type: GraphQLInt } },
  async resolve(parent, { skipMult }, context) {
    try {
      const size = 20;
      if (
        !context.user ||
        !context.profile.following ||
        !(context.profile.following instanceof Map)
      ) {
        return;
      }
      let following = context.profile.followingTopics.keys();
      return await Post.find({
        tags: { $in: Array.from(following) },
      })
        .sort({ dateCreated: -1 })
        .skip(size * skipMult)
        .limit(size);
    } catch (err) {
      console.log(err);
    }
  },
};

module.exports = {
  getFollowingFeed,
  getFollowingTopicsFeed,
};

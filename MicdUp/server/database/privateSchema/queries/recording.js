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
      console.log(context.profile.blockedMap);
      let blocked = [...context.profile.blockedMap.keys()];
      let blockedBy = [...context.profile.blockedByMap.keys()];
      let following = context.profile.following.keys();
      let res = await Post.find({
        $and: [
          { owner: { $in: Array.from(following) } },
          { owner: { $nin: blocked } },
          { owner: { $nin: blockedBy } },
        ],
      })
        .sort({ dateCreated: -1 })
        .skip(size * skipMult)
        .limit(size);
      console.log(res, blocked);
      return res;
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
      let blocked = [...context.profile.blockedMap.keys()];
      let blockedBy = [...context.profile.blockedByMap.keys()];
      let following = context.profile.followingTopics.keys();
      return await Post.find({
        $and: [
          { tags: { $in: Array.from(following) } },
          { owner: { $nin: blocked } },
          { owner: { $nin: blockedBy } },
        ],
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

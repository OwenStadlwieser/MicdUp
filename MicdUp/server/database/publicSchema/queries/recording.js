const { Post } = require("../../models/Post");
const { Tag } = require("../../models/Tag");
const { Comment } = require("../../models/Comment");
const { Profile } = require("../../models/Profile");
const { PostType, CommentType } = require("../../types");
const {
  GraphQLList,
  GraphQLString,
  GraphQLID,
  GraphQLInt,
} = require("graphql");
const getUserPosts = {
  type: new GraphQLList(PostType),
  args: { userId: { type: GraphQLID }, skipMult: { type: GraphQLInt } },
  async resolve(parent, { userId, skipMult }, context) {
    try {
      const size = 20;
      let blocked = [];
      let blockedBy = [];
      if (context.profile) {
        blocked = [...context.profile.blockedMap.keys()];
        blockedBy = [...context.profile.blockedByMap.keys()];
      }
      const posts = await Post.find({
        $and: [
          {
            owner: userId,
          },
          { owner: { $nin: blocked } },
          { owner: { $nin: blockedBy } },
        ],
      })
        .sort({ dateCreated: -1 })
        .skip(size * skipMult)
        .limit(size);
      return posts;
    } catch (err) {
      console.log(err);
    }
  },
};

const getRecordingsFromTag = {
  type: new GraphQLList(PostType),
  args: { searchTag: { type: GraphQLID }, skipMult: { type: GraphQLInt } },
  async resolve(parent, { searchTag, skipMult }, context) {
    try {
      const size = 20;
      const tag = await Tag.findByIdAndUpdate(searchTag, {
        $inc: { searches: 1, hr24searches: 1 },
      });
      let blocked = [];
      let blockedBy = [];
      if (context.profile) {
        await Profile.findByIdAndUpdate(context.profile.id, {
          $push: { searchedTags: tag._id },
        });
        blocked = [...context.profile.blockedMap.keys()];
        blockedBy = [...context.profile.blockedByMap.keys()];
      }
      if (!tag || !tag.posts || tag.posts.length === 0) {
        return [];
      }
      const posts = await Post.aggregate([
        {
          $match: {
            $and: [
              { _id: { $in: tag.posts } },
              { owner: { $nin: blocked } },
              { owner: { $nin: blockedBy } },
            ],
          },
        },
        {
          $addFields: {
            likers_count: {
              $size: { $ifNull: ["$likers", []] },
            },
          },
        },
        { $sort: { likers_count: 1 } },
      ])
        .sort({ dateCreated: -1 })
        .skip(size * skipMult)
        .limit(size);
      return posts;
    } catch (err) {
      console.log(err);
    }
  },
};

const getComments = {
  type: new GraphQLList(CommentType),
  args: { postId: { type: GraphQLID }, skipMult: { type: GraphQLInt } },
  async resolve(parent, { postId, skipMult }, context) {
    try {
      let blocked = [];
      let blockedBy = [];
      if (context.profile) {
        console.log(context.profile);
        blocked = [...context.profile.blockedMap.keys()];
        blockedBy = [...context.profile.blockedByMap.keys()];
      }
      console.log(blocked, blockedBy);
      const size = 60;
      const post = await Post.findById(postId);
      const comments = await Comment.find({
        $and: [
          { _id: { $in: post.comments } },
          { owner: { $nin: blocked } },
          { owner: { $nin: blockedBy } },
        ],
      })
        .sort({ dateCreated: -1 })
        .skip(size * skipMult)
        .limit(size);
      console.log(comments);
      return comments;
    } catch (err) {
      console.log(err);
    }
  },
};

const getNotLoggedInFeed = {
  type: new GraphQLList(PostType),
  args: { skipMult: { type: GraphQLInt } },
  async resolve(parent, { skipMult }, context) {
    try {
      const size = 20;
      const posts = await Post.aggregate([
        {
          $addFields: {
            likers_count: {
              $size: { $ifNull: ["$likers", []] },
            },
          },
        },
        {
          $sort: { likers_count: -1 },
        },
      ])
        .skip(size * skipMult)
        .limit(size);
      return posts;
    } catch (err) {
      console.log(err);
    }
  },
};

module.exports = {
  getUserPosts,
  getComments,
  getRecordingsFromTag,
  getNotLoggedInFeed,
};

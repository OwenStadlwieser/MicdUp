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
      const posts = await Post.find({ owner: userId })
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
    if (!context.user.id) return [];
    try {
      const size = 20;
      const tag = await Tag.findByIdAndUpdate(searchTag, {
        $inc: { searches: 1, hr24searches: 1 },
      });
      await Profile.findByIdAndUpdate(context.profile.id, {
        $push: { searchedTags: tag._id },
      });
      if (!tag || !tag.posts || tag.posts.length === 0) {
        return [];
      }
      const posts = await Post.aggregate([
        {
          $match: { _id: { $in: tag.posts } },
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
      const size = 60;
      const post = await Post.findById(postId);
      const comments = await Comment.find({ _id: { $in: post.comments } })
        .sort({ dateCreated: -1 })
        .skip(size * skipMult)
        .limit(size);
      return comments;
    } catch (err) {
      console.log(err);
    }
  },
};

module.exports = {
  getUserPosts,
  getComments,
  getRecordingsFromTag,
};

const { Post } = require("../../models/Post");
const { Comment } = require("../../models/Comment");
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
};

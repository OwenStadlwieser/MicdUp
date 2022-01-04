const { Post } = require("../../models/Post");
const { PostType } = require("../../types");
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

module.exports = {
  getUserPosts,
};

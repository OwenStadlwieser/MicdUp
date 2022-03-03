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
const { Post } = require("../../models/Post");
const { PostType } = require("../../types");
const addListener = {
  type: PostType,
  args: {
    postId: { type: GraphQLID },
    ipAddr: { type: GraphQLString },
    listenTime: { type: GraphQLFloat },
  },
  async resolve(parent, { postId, ipAddr, listenTime }, context) {
    const post = await Post.findOne({
      _id: postId,
    });
    if (!post) {
      throw new Error("Post not found");
    }
    if (post.nonAuthListeners.get(`${ipAddr}`)) {
      const oldTime = post.nonAuthListeners.get(`${ipAddr}`);
      if (oldTime >= listenTime) return;
      post.nonAuthListeners.set(`${ipAddr}`, listenTime);
      return post;
    }
    post.nonAuthListeners.set(`${ipAddr}`, listenTime);
    await post.save();
    return post;
  },
};

module.exports = { addListener };

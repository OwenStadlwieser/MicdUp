const graphql = require("graphql"); //use graphql package
const { User } = require("../database/models/User");
const { Profile } = require("../database/models/Profile");
const { Tag } = require("./models/Tag");
const { Post } = require("./models/Post");
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

const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: GraphQLID },
    userName: { type: GraphQLString },
    email: { type: GraphQLString },
    phone: { type: GraphQLString },
    dob: { type: GraphQLFloat },
    dateCreated: { type: GraphQLFloat },
    type: {
      type: GraphQLString,
      resolve(parent) {
        return parent.__t;
      },
    },
  }),
});

const ProfileType = new GraphQLObjectType({
  name: "Profile",
  fields: () => ({
    posts: {
      type: new GraphQLList(PostType),
      async resolve(parent) {
        await Post.find({ _id: { $in: parent.posts } });
      },
    },
  }),
});

const PostType = new GraphQLObjectType({
  name: "Post",
  fields: () => ({
    id: { type: GraphQLID },
    owner: {
      type: ProfileType,
      async resolve(parent) {
        return await Profile.findById(parent.owner);
      },
    },
    nsfw: { type: GraphQLBoolean },
    allowRebuttal: { type: GraphQLBoolean },
    allowStitch: { type: GraphQLBoolean },
    privatePost: { type: GraphQLBoolean },
    filePath: {
      type: GraphQLString,
      resolve(parent) {
        return parent._id + parent.fileExtension;
      },
    },
    hashTags: {
      type: new GraphQLList(TagsType),
      async resolve(parent) {
        return await Tag.find({ _id: { $in: parent.hashTags } });
      },
    },
    dateCreated: { type: GraphQLFloat },
  }),
});

const MessageType = new GraphQLObjectType({
  name: "Message",
  fields: () => ({
    success: { type: GraphQLBoolean },
    message: { type: GraphQLString },
  }),
});

const TagsType = new GraphQLObjectType({
  name: "Tags",
  fields: () => ({
    title: { type: GraphQLString },
    count: {
      type: GraphQLInt,
      resolve(parent) {
        return parent.posts.length;
      },
    },
    posts: {
      type: new GraphQLList(PostType),
      async resolve(parent) {
        return await Post.find({ _id: { $in: parent.posts } });
      },
    },
  }),
});

module.exports = { UserType, MessageType, PostType, TagsType };

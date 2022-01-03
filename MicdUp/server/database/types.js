const graphql = require("graphql"); //use graphql package
const { User } = require("../database/models/User");
const { Profile } = require("../database/models/Profile");
const { Tag } = require("./models/Tag");
const { Post } = require("./models/Post");
const { Bio } = require("./models/Bio");
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
const { getFile } = require("../utils/awsS3");
const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: GraphQLID },
    userName: { type: GraphQLString },
    email: { type: GraphQLString },
    phone: { type: GraphQLString },
    dob: { type: GraphQLFloat },
    dateCreated: { type: GraphQLFloat },
    profile: {
      type: ProfileType,
      async resolve(parent) {
        return await Profile.findById(parent.profile);
      },
    },
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
    id: { type: GraphQLID },
    posts: {
      type: new GraphQLList(PostType),
      async resolve(parent) {
        return await Post.find({ _id: { $in: parent.posts } });
      },
    },
    bio: {
      type: BioType,
      async resolve(parent) {
        const res = await Bio.findOne({ _id: parent.bio });
        return res;
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
    signedUrl: {
      type: GraphQLString,
      async resolve(parent) {
        if (
          parent.signedUrl &&
          parent.lastFetched &&
          parent.lastFetched + 60 * 30 < Date.now()
        ) {
          return parent.signedUrl;
        }
        const post = await Post.findById(parent._id);
        post.signedUrl = await getFile(parent._id + parent.fileExtension);
        post.lastFetched = Date.now();
        await post.save();
        return post.signedUrl;
      },
    },
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

const BioType = new GraphQLObjectType({
  name: "Bio",
  fields: () => ({
    id: { type: GraphQLID },
    owner: {
      type: ProfileType,
      async resolve(parent) {
        return await Profile.findById(parent.owner);
      },
    },
    signedUrl: {
      type: GraphQLString,
      async resolve(parent) {
        if (
          parent.signedUrl &&
          parent.lastFetched &&
          parent.lastFetched + 60 * 30 < Date.now()
        ) {
          return parent.signedUrl;
        }
        const bio = await Bio.findById(parent._id);
        bio.signedUrl = await getFile(parent._id + parent.fileExtension);
        bio.lastFetched = Date.now();
        await bio.save();
        return bio.signedUrl;
      },
    },
    filePath: {
      type: GraphQLString,
      resolve(parent) {
        return parent._id + parent.fileExtension;
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
    _id: { type: GraphQLID },
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

module.exports = { UserType, MessageType, PostType, TagsType, BioType };

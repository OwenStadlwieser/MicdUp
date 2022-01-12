const graphql = require("graphql"); //use graphql package
const { User } = require("../database/models/User");
const { Profile } = require("../database/models/Profile");
const { Tag } = require("./models/Tag");
const { Post } = require("./models/Post");
const { File } = require("./models/File");
const { Comment } = require("./models/Comment");
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
    _id: { type: GraphQLID },
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
      type: FileType,
      async resolve(parent) {
        const res = await File.findOne({ _id: parent.bio });
        return res;
      },
    },
    image: {
      type: FileType,
      async resolve(parent) {
        const res = await File.findOne({ _id: parent.image });
        return res;
      },
    },
    user: {
      type: UserType,
      async resolve(parent) {
        return await User.findById(parent.user);
      },
    },
  }),
});

const CommentWithoutReplyType = new GraphQLObjectType({
  name: "CommentNoReply",
  fields: () => ({
    id: { type: GraphQLID },
    owner: {
      type: ProfileType,
      async resolve(parent) {
        return await Profile.findById(parent.owner);
      },
    },
    text: { type: GraphQLString },
    signedUrl: {
      type: GraphQLString,
      async resolve(parent) {
        if (!parent.fileExtension) {
          return "";
        }
        if (
          parent.signedUrl &&
          parent.lastFetched &&
          parent.lastFetched + 60 * 30 < Date.now()
        ) {
          return parent.signedUrl;
        }
        const post = await Comment.findById(parent._id);
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
    likers: {
      type: new GraphQLList(ProfileType),
      async resolve(parent) {
        return await Profile.find({ _id: { $in: parent.likers } });
      },
    },
    likes: {
      type: GraphQLInt,
      resolve(parent, args, context, info) {
        return parent.likers.length;
      },
    },
    isLikedByUser: {
      type: GraphQLInt,
      resolve(parent, args, context, info) {
        const index = parent.likers.findIndex((id) => {
          return id.toString() === context.profile.id;
        });
        return index > -1;
      },
    },
    dateCreated: { type: GraphQLFloat },
  }),
});

const CommentType = new GraphQLObjectType({
  name: "Comment",
  fields: () => ({
    id: { type: GraphQLID },
    owner: {
      type: ProfileType,
      async resolve(parent) {
        return await Profile.findById(parent.owner);
      },
    },
    isDeleted: { type: GraphQLBoolean },
    replies: {
      type: new GraphQLList(CommentWithoutReplyType),
      async resolve(parent) {
        const res = await Comment.find({ _id: { $in: parent.replies } }).sort({
          dateCreated: -1,
        });
        return res;
      },
    },
    allReplies: {
      type: new GraphQLList(CommentType),
      async resolve(parent) {
        return await Comment.find({ _id: { $in: parent.replies } }).sort({
          dateCreated: -1,
        });
      },
    },
    repliesLength: {
      type: GraphQLInt,
      resolve(parent) {
        return parent.replies.length;
      },
    },
    ultimateParent: { type: GraphQLID },
    text: { type: GraphQLString },
    signedUrl: {
      type: GraphQLString,
      async resolve(parent) {
        if (!parent.fileExtension) {
          return "";
        }
        if (
          parent.signedUrl &&
          parent.lastFetched &&
          parent.lastFetched + 60 * 30 < Date.now()
        ) {
          return parent.signedUrl;
        }
        const post = await Comment.findById(parent._id);
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
    likers: {
      type: new GraphQLList(ProfileType),
      async resolve(parent) {
        return await Profile.find({ _id: { $in: parent.likers } });
      },
    },
    likes: {
      type: GraphQLInt,
      resolve(parent, args, context, info) {
        return parent.likers.length;
      },
    },
    isLikedByUser: {
      type: GraphQLInt,
      resolve(parent, args, context, info) {
        const index = parent.likers.findIndex((id) => {
          return id.toString() === context.profile.id;
        });
        return index > -1;
      },
    },
    dateCreated: { type: GraphQLFloat },
  }),
});

const PostType = new GraphQLObjectType({
  name: "Post",
  fields: () => ({
    id: { type: GraphQLID },
    title: { type: GraphQLString },
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
    likers: {
      type: new GraphQLList(ProfileType),
      async resolve(parent) {
        return await Profile.find({ _id: { $in: parent.likers } });
      },
    },
    comments: {
      type: new GraphQLList(CommentType),
      async resolve(parent) {
        return await Comment.find({ _id: { $in: parent.comments } });
      },
    },
    likes: {
      type: GraphQLInt,
      resolve(parent, args, context, info) {
        return parent.likers.length;
      },
    },
    isLikedByUser: {
      type: GraphQLInt,
      resolve(parent, args, context, info) {
        const index = parent.likers.findIndex((id) => {
          return id.toString() === context.profile.id;
        });
        return index > -1;
      },
    },
    dateCreated: { type: GraphQLFloat },
  }),
});

const FileType = new GraphQLObjectType({
  name: "File",
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
        const file = await File.findById(parent._id);
        file.signedUrl = await getFile(parent._id + parent.fileExtension);
        file.lastFetched = Date.now();
        await file.save();
        return file.signedUrl;
      },
    },
    filePath: {
      type: GraphQLString,
      resolve(parent) {
        return parent._id + parent.fileExtension;
      },
    },
    fileExtension: {
      type: GraphQLString,
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

const PromptsType = new GraphQLObjectType({
  name: "Prompts",
  fields: () => ({
    _id: { type: GraphQLID },
    prompt: { type: GraphQLString },
    tag: {
      type: TagsType,
      async resolve(parent) {
        return await Tag.findById(parent.tag);
      },
    },
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

module.exports = {
  UserType,
  MessageType,
  PostType,
  TagsType,
  FileType,
  PromptsType,
  CommentType,
};

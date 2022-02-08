const graphql = require("graphql"); //use graphql package
const { User } = require("../database/models/User");
const { Profile } = require("../database/models/Profile");
const { Tag } = require("./models/Tag");
const { Post } = require("./models/Post");
const { File } = require("./models/File");
const { Chat } = require("./models/Chat");
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
    id: {
      type: GraphQLID,
      resolve(parent) {
        return parent._id;
      },
    },
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
    id: {
      type: GraphQLID,
      resolve(parent) {
        return parent.id;
      },
    },
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
    followingCount: {
      type: GraphQLInt,
      resolve(parent) {
        return Array.from(parent.following.keys()).length;
      },
    },
    followersCount: {
      type: GraphQLInt,
      resolve(parent) {
        return Array.from(parent.followers.keys()).length;
      },
    },
    isFollowedByUser: {
      type: GraphQLBoolean,
      resolve(parent, args, context, info) {
        const index = parent.followers.get(context.profile.id);
        return index === "1";
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
    id: {
      type: GraphQLID,
      resolve(parent) {
        return parent._id;
      },
    },
    title: { type: GraphQLString },
    owner: {
      type: ProfileType,
      async resolve(parent) {
        return await Profile.findById(parent.owner);
      },
    },
    speechToText: {
      type: new GraphQLList(
        new GraphQLObjectType({
          name: "postType",
          fields: () => ({
            word: { type: GraphQLString },
            time: { type: GraphQLFloat },
          }),
        })
      ),
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

const ChatType = new GraphQLObjectType({
  name: "Chat",
  fields: () => ({
    id: { type: GraphQLID },
    creator: {
      type: ProfileType,
      async resolve(parent) {
        return await Profile.findById(parent.creator);
      },
    },
    members: {
      type: new GraphQLList(ProfileType),
      async resolve(parent) {
        return await Profile.find({ _id: { $in: parent.members } });
      },
    },
    chatMessages: {
      type: new GraphQLList(ChatMessageType),
      async resolve(parent) {
        const size = 20;
        const skipMult = 0;
        return await Chat.find({ _id: { $in: parent.messages } })
          .sort({ dateCreated: -1 })
          .skip(size * skipMult)
          .limit(size);
      },
    },
  }),
});

const ChatMessageType = new GraphQLObjectType({
  name: "ChatMessage",
  fields: () => ({
    id: { type: GraphQLID },
    owner: {
      type: ProfileType,
      async resolve(parent) {
        return await Profile.findById(parent.owner);
      },
    },
    seenBy: {
      type: new GraphQLList(GraphQLID),
    },
    isLikedByUser: {
      type: GraphQLBoolean,
      resolve(parent, args, context, info) {
        // FIXME: unneeded logic
        parent.likers = parent.likers ? parent.likers : new Map();
        const index = parent.likers.get(context.profile.id);
        return index === "1";
      },
    },
    likersCount: {
      type: GraphQLInt,
      resolve(parent) {
        return Array.from(parent.likers.keys()).length;
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

const FilterType = new GraphQLObjectType({
  name: "Filter",
  fields: () => ({
    id: {
      type: GraphQLID,
      resolve(parent) {
        return parent._id;
      },
    },
    title: {
      type: GraphQLString,
    },
    type: {
      type: GraphQLString,
    },
    posts: {
      type: new GraphQLList(PostType),
      async resolve(parent) {
        return await Post.find({ _id: { $in: parent.posts } });
      },
    },
    image: {
      type: FileType,
      async resolve(parent) {
        const res = await File.findOne({ _id: parent.image });
        return res;
      },
    },
    reverbPreset: {
      type: GraphQLInt,
    },
    reverb: {
      type: GraphQLInt,
    },
    distortionPreset: {
      type: GraphQLInt,
    },
    distortion: {
      type: GraphQLInt,
    },
    equalizerPreset: {
      type: GraphQLInt,
    },
    pitchNum: {
      type: GraphQLInt,
    },
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

const NotifType = new GraphQLObjectType({
  name: "Notif",
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
  ProfileType,
  ChatType,
  ChatMessageType,
  NotifType,
  FilterType,
};

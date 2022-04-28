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
const {
  checkIfIsInPrivateList,
  checkIfBlocked,
  profileCheckForBlocked,
} = require("../utils/securityHelpers");

const UserPrivateType = new GraphQLObjectType({
  name: "UserPrivateType",
  fields: () => ({
    _id: { type: GraphQLID },
    id: {
      type: GraphQLID,
      resolve(parent, args, context, info) {
        return parent._id;
      },
    },
    userName: { type: GraphQLString },
    email: { type: GraphQLString },
    phone: { type: GraphQLString },
    dob: { type: GraphQLFloat },
    dateCreated: { type: GraphQLFloat },
    profile: {
      type: ProfilePrivateType,
      async resolve(parent, args, context, info) {
        return await Profile.findById(parent.profile);
      },
    },
    type: {
      type: GraphQLString,
      resolve(parent, args, context, info) {
        return parent.__t;
      },
    },
  }),
});

const UserPublicType = new GraphQLObjectType({
  name: "UserPublicType",
  fields: () => ({
    _id: { type: GraphQLID },
    id: {
      type: GraphQLID,
      resolve(parent, args, context, info) {
        return parent._id;
      },
    },
    userName: { type: GraphQLString },
    profile: {
      type: ProfilePublicType,
      async resolve(parent, args, context, info) {
        return await Profile.findById(parent.profile);
      },
    },
  }),
});

const ProfilePrivateType = new GraphQLObjectType({
  name: "ProfilePrivateType",
  fields: () => ({
    id: {
      type: GraphQLID,
      resolve(parent, args, context, info) {
        return parent.id;
      },
    },
    isBlockedByUser: {
      type: GraphQLBoolean,
      resolve() {
        return false;
      },
    },
    blocked: {
      type: new GraphQLList(GraphQLID),
    },
    posts: {
      type: new GraphQLList(PostType),
      async resolve(parent, args, context, info) {
        return await Post.find({ _id: { $in: parent.posts } });
      },
    },
    bio: {
      type: FileType,
      async resolve(parent, args, context, info) {
        const res = await File.findOne({ _id: parent.bio });
        return res;
      },
    },
    image: {
      type: FileType,
      async resolve(parent, args, context, info) {
        const res = await File.findOne({ _id: parent.image });
        return res;
      },
    },
    user: {
      type: UserPrivateType,
      async resolve(parent, args, context, info) {
        return await User.findById(parent.user);
      },
    },
    followingCount: {
      type: GraphQLInt,
      resolve(parent, args, context, info) {
        return Array.from(parent.following.keys()).length;
      },
    },
    followersCount: {
      type: GraphQLInt,
      resolve(parent, args, context, info) {
        return Array.from(parent.followers.keys()).length;
      },
    },
    privates: {
      type: new GraphQLList(ProfilePublicType),
      async resolve(parent, args, context, info) {
        const skip = context.skipMult ? context.skipMult : 0;
        const keys = Array.from(context.profile.privates.keys());
        return await Profile.find({ _id: { $in: keys } }).skip(skip);
      },
    },
    isFollowedByUser: {
      type: GraphQLBoolean,
      resolve(parent, args, context, info) {
        if (!context.profile || !context.profile.id || !parent.followers)
          return false;

        const index = parent.followers.get(context.profile.id);
        return index === "1";
      },
    },
    isPrivateByUser: {
      type: GraphQLBoolean,
      resolve(parent, args, context, info) {
        if (!context.profile || !context.profile.id) return false;
        const index = context.profile.privates.get(parent.id);
        return index === "1";
      },
    },
    privatesCount: {
      type: GraphQLInt,
      resolve(parent, args, context, info) {
        return Array.from(parent.privates.keys()).length;
      },
    },
    canViewPrivatesFromUser: {
      type: GraphQLBoolean,
      resolve() {
        return true;
      },
    },
  }),
});

const ProfilePublicType = new GraphQLObjectType({
  name: "ProfilePublicType",
  fields: () => ({
    id: {
      type: GraphQLID,
      resolve(parent, args, context, info) {
        return parent.id;
      },
    },
    posts: {
      type: new GraphQLList(PostType),
      async resolve(parent, args, context, info) {
        if (profileCheckForBlocked(context, parent) < 0) {
          return [];
        }
        return await Post.find({ _id: { $in: parent.posts } });
      },
    },
    bio: {
      type: FileType,
      async resolve(parent, args, context, info) {
        const res = await File.findOne({ _id: parent.bio });
        if (profileCheckForBlocked(context, parent) < 0) {
          return null;
        }
        return res;
      },
    },
    image: {
      type: FileType,
      async resolve(parent, args, context, info) {
        const res = await File.findOne({ _id: parent.image });
        if (profileCheckForBlocked(context, parent) < 0) {
          return null;
        }
        return res;
      },
    },
    user: {
      type: UserPublicType,
      async resolve(parent, args, context, info) {
        return await User.findById(parent.user);
      },
    },
    followingCount: {
      type: GraphQLInt,
      resolve(parent, args, context, info) {
        if (profileCheckForBlocked(context, parent) < 0) {
          return 0;
        }
        return Array.from(parent.following.keys()).length;
      },
    },
    followersCount: {
      type: GraphQLInt,
      resolve(parent, args, context, info) {
        if (profileCheckForBlocked(context, parent) < 0) {
          return 0;
        }
        return Array.from(parent.followers.keys()).length;
      },
    },
    isBlockedByUser: {
      type: GraphQLBoolean,
      resolve(parent, args, context, info) {
        if (context.profile) {
          let blocked = [...context.profile.blockedMap.keys()];
          return (
            blocked.findIndex(
              (blockedmember) => blockedmember.toString() === parent.id
            ) > -1
          );
        }
        return false;
      },
    },
    privatesCount: {
      type: GraphQLInt,
      resolve(parent, args, context, info) {
        if (profileCheckForBlocked(context, parent) < 0) {
          return 0;
        }
        return Array.from(parent.privates.keys()).length;
      },
    },
    followers: {
      type: new GraphQLList(ProfilePublicType),
      async resolve(parent, args, context, info) {
        const skip = context.skipMult ? context.skipMult : 0;
        const keys = Array.from(parent.followers.keys());
        if (profileCheckForBlocked(context, parent) < 0) {
          return [];
        }
        return await Profile.find({ _id: { $in: keys } }).skip(skip);
      },
    },
    following: {
      type: new GraphQLList(ProfilePublicType),
      async resolve(parent, args, context, info) {
        const skip = context.skipMult ? context.skipMult : 0;
        const keys = Array.from(parent.following.keys());
        if (profileCheckForBlocked(context, parent) < 0) {
          return [];
        }
        return await Profile.find({ _id: { $in: keys } }).skip(skip);
      },
    },
    isFollowedByUser: {
      type: GraphQLBoolean,
      resolve(parent, args, context, info) {
        if (!context.profile || !context.profile.id || !parent.followers)
          return false;

        const index = parent.followers.get(context.profile.id);
        return index === "1";
      },
    },
    isPrivateByUser: {
      type: GraphQLBoolean,
      resolve(parent, args, context, info) {
        if (!context.profile || !context.profile.id) return false;
        const index = context.profile.privates.get(parent.id);
        return index === "1";
      },
    },
    canViewPrivatesFromUser: {
      type: GraphQLBoolean,
      resolve(parent, args, context, info) {
        if (
          !parent ||
          !parent.privates ||
          !context.profile ||
          !context.profile.id
        )
          return false;
        if (profileCheckForBlocked(context, parent) < 0) {
          return false;
        }
        const index = parent.privates.get(context.profile.id);
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
      type: ProfilePublicType,
      async resolve(parent, args, context, info) {
        return await Profile.findById(parent.owner);
      },
    },
    duration: {
      type: GraphQLInt,
      resolve(parent, args, context, info) {
        return Math.floor(parent.duration * 1000);
      },
    },
    speechToText: {
      type: new GraphQLList(
        new GraphQLObjectType({
          name: "CommentWithoutReplySpeech",
          fields: () => ({
            word: { type: GraphQLString },
            time: { type: GraphQLFloat },
          }),
        })
      ),
    },
    text: { type: GraphQLString },
    signedUrl: {
      type: GraphQLString,
      async resolve(parent, args, context, info) {
        var d1 = new Date();
        d1.toUTCString();
        if (!parent.fileExtension) {
          return "";
        }
        if (
          parent.signedUrl &&
          parent.lastFetched &&
          parent.lastFetched + 60 * 30 < Math.floor(d1.getTime() / 1000)
        ) {
          return parent.signedUrl;
        }
        const post = await Comment.findById(parent._id);
        post.signedUrl = await getFile(parent._id + parent.fileExtension);
        post.lastFetched = Math.floor(d1.getTime() / 1000);
        await post.save();
        return post.signedUrl;
      },
    },
    filePath: {
      type: GraphQLString,
      resolve(parent, args, context, info) {
        return parent._id + parent.fileExtension;
      },
    },
    likers: {
      type: new GraphQLList(ProfilePublicType),
      async resolve(parent, args, context, info) {
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
          if (!context.profile || !context.profile.id) return false;
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
      type: ProfilePublicType,
      async resolve(parent, args, context, info) {
        return await Profile.findById(parent.owner);
      },
    },
    speechToText: {
      type: new GraphQLList(
        new GraphQLObjectType({
          name: "CommentSpeech",
          fields: () => ({
            word: { type: GraphQLString },
            time: { type: GraphQLFloat },
          }),
        })
      ),
    },
    duration: {
      type: GraphQLInt,
      resolve(parent, args, context, info) {
        return Math.floor(parent.duration * 1000);
      },
    },
    isDeleted: { type: GraphQLBoolean },
    replies: {
      type: new GraphQLList(CommentWithoutReplyType),
      async resolve(parent, args, context, info) {
        const res = await Comment.find({ _id: { $in: parent.replies } }).sort({
          dateCreated: -1,
        });
        return res;
      },
    },
    allReplies: {
      type: new GraphQLList(CommentType),
      async resolve(parent, args, context, info) {
        let blocked = [];
        let blockedBy = [];
        if (context.profile) {
          blocked = [...context.profile.blockedMap.keys()];
          blockedBy = [...context.profile.blockedByMap.keys()];
        }
        return await Comment.find({
          $and: [
            {
              _id: { $in: parent.replies },
            },
            { owner: { $nin: blocked } },
            { owner: { $nin: blockedBy } },
          ],
        }).sort({
          dateCreated: -1,
        });
      },
    },
    repliesLength: {
      type: GraphQLInt,
      resolve(parent, args, context, info) {
        return parent.replies.length;
      },
    },
    ultimateParent: { type: GraphQLID },
    text: { type: GraphQLString },
    signedUrl: {
      type: GraphQLString,
      async resolve(parent, args, context, info) {
        var d1 = new Date();
        d1.toUTCString();
        if (!parent.fileExtension) {
          return "";
        }
        if (
          parent.signedUrl &&
          parent.lastFetched &&
          parent.lastFetched + 60 * 30 < Math.floor(d1.getTime() / 1000)
        ) {
          return parent.signedUrl;
        }
        const post = await Comment.findById(parent._id);
        post.signedUrl = await getFile(parent._id + parent.fileExtension);
        post.lastFetched = Math.floor(d1.getTime() / 1000);
        await post.save();
        return post.signedUrl;
      },
    },
    filePath: {
      type: GraphQLString,
      resolve(parent, args, context, info) {
        return parent._id + parent.fileExtension;
      },
    },
    likers: {
      type: new GraphQLList(ProfilePublicType),
      async resolve(parent, args, context, info) {
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
          if (!context.profile || !context.profile.id) return false;
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
      resolve(parent, args, context, info) {
        return parent._id;
      },
    },
    tags: {
      type: new GraphQLList(TagsType),
      async resolve(parent, args, context, info) {
        return await Tag.find({ _id: { $in: parent.tags } });
      },
    },
    duration: {
      type: GraphQLInt,
      resolve(parent, args, context, info) {
        return Math.floor(parent.duration * 1000);
      },
    },
    title: { type: GraphQLString },
    owner: {
      type: ProfilePublicType,
      async resolve(parent, args, context, info) {
        return await Profile.findById(parent.owner);
      },
    },
    speechToText: {
      type: new GraphQLList(
        new GraphQLObjectType({
          name: "PostSpeech",
          fields: () => ({
            word: { type: GraphQLString },
            time: { type: GraphQLFloat },
          }),
        })
      ),
      async resolve(parent, args, context, info) {
        const index = await checkIfIsInPrivateList(context, parent);
        if (index > -1) {
          return parent.speechToText;
        }
        return [];
      },
    },
    nsfw: { type: GraphQLBoolean },
    allowRebuttal: { type: GraphQLBoolean },
    allowStitch: { type: GraphQLBoolean },
    privatePost: { type: GraphQLBoolean },
    signedUrl: {
      type: GraphQLString,
      async resolve(parent, a, context, i) {
        var d1 = new Date();
        d1.toUTCString();
        const index = await checkIfIsInPrivateList(context, parent);
        if (index < 0) return "";
        if (
          parent.signedUrl &&
          parent.lastFetched &&
          parent.lastFetched + 60 * 30 < Math.floor(d1.getTime() / 1000)
        ) {
          return parent.signedUrl;
        }
        const post = await Post.findById(parent._id);
        post.signedUrl = await getFile(parent._id + parent.fileExtension);
        post.lastFetched = Math.floor(d1.getTime() / 1000);
        await post.save();
        return post.signedUrl;
      },
    },
    filePath: {
      type: GraphQLString,
      resolve(parent, args, context, info) {
        return parent._id + parent.fileExtension;
      },
    },
    hashTags: {
      type: new GraphQLList(TagsType),
      async resolve(parent, a, context, i) {
        const index = await checkIfIsInPrivateList(context, parent);
        if (index < 0) return [];
        return await Tag.find({ _id: { $in: parent.hashTags } });
      },
    },
    likers: {
      type: new GraphQLList(ProfilePublicType),
      async resolve(parent, a, context, i) {
        const index = await checkIfIsInPrivateList(context, parent);
        if (index < 0) return [];
        return await Profile.find({ _id: { $in: parent.likers } });
      },
    },
    comments: {
      type: new GraphQLList(CommentType),
      async resolve(parent, a, context, i) {
        let blocked = [];
        let blockedBy = [];
        if (context.profile) {
          blocked = [...context.profile.blockedMap.keys()];
          blockedBy = [...context.profile.blockedByMap.keys()];
        }
        const index = await checkIfIsInPrivateList(context, parent);
        if (index < 0) return [];
        return await Comment.find({
          $and: [
            { _id: { $in: parent.comments } },
            { owner: { $nin: blocked } },
            { owner: { $nin: blockedBy } },
          ],
        });
      },
    },
    likes: {
      type: GraphQLInt,
      resolve(parent, args, context, info) {
        return parent.likers.length;
      },
    },
    numComments: {
      type: GraphQLInt,
      resolve(parent, args, context, info) {
        return parent.comments.length;
      },
    },
    isLikedByUser: {
      type: GraphQLInt,
      resolve(parent, args, context, info) {
        const index = parent.likers.findIndex((id) => {
          if (!context.profile || !context.profile.id) return false;
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
      type: ProfilePublicType,
      async resolve(parent, args, context, info) {
        return await Profile.findById(parent.creator);
      },
    },
    duration: {
      type: GraphQLInt,
      resolve(parent, args, context, info) {
        return Math.floor(parent.duration * 1000);
      },
    },
    members: {
      type: new GraphQLList(ProfilePublicType),
      async resolve(parent, args, context, info) {
        return await Profile.find({ _id: { $in: parent.members } });
      },
    },
    chatMessages: {
      type: new GraphQLList(ChatMessageType),
      async resolve(parent, args, context, info) {
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
      type: ProfilePublicType,
      async resolve(parent, args, context, info) {
        return await Profile.findById(parent.owner);
      },
    },
    duration: {
      type: GraphQLInt,
      resolve(parent, args, context, info) {
        return Math.floor(parent.duration * 1000);
      },
    },
    speechToText: {
      type: new GraphQLList(
        new GraphQLObjectType({
          name: "MessageSpeech",
          fields: () => ({
            word: { type: GraphQLString },
            time: { type: GraphQLFloat },
          }),
        })
      ),
    },
    seenBy: {
      type: new GraphQLList(GraphQLID),
    },
    isLikedByUser: {
      type: GraphQLBoolean,
      resolve(parent, args, context, info) {
        // FIXME: unneeded logic
        parent.likers = parent.likers ? parent.likers : new Map();
        if (!context.profile || !context.profile.id) return false;
        const index = parent.likers.get(context.profile.id);
        return index === "1";
      },
    },
    likersCount: {
      type: GraphQLInt,
      resolve(parent, args, context, info) {
        return Array.from(parent.likers.keys()).length;
      },
    },
    signedUrl: {
      type: GraphQLString,
      async resolve(parent, args, context, info) {
        var d1 = new Date();
        d1.toUTCString();
        if (
          parent.signedUrl &&
          parent.lastFetched &&
          parent.lastFetched + 60 * 30 < Math.floor(d1.getTime() / 1000)
        ) {
          return parent.signedUrl;
        }
        const file = await File.findById(parent._id);
        file.signedUrl = await getFile(parent._id + parent.fileExtension);
        file.lastFetched = Math.floor(d1.getTime() / 1000);
        await file.save();
        return file.signedUrl;
      },
    },
    filePath: {
      type: GraphQLString,
      resolve(parent, args, context, info) {
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
      resolve(parent, args, context, info) {
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
      async resolve(parent, args, context, info) {
        return await Post.find({ _id: { $in: parent.posts } });
      },
    },
    image: {
      type: FileType,
      async resolve(parent, args, context, info) {
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
      type: ProfilePublicType,
      async resolve(parent, args, context, info) {
        return await Profile.findById(parent.owner);
      },
    },
    speechToText: {
      type: new GraphQLList(
        new GraphQLObjectType({
          name: "FileSpeech",
          fields: () => ({
            word: { type: GraphQLString },
            time: { type: GraphQLFloat },
          }),
        })
      ),
    },
    duration: {
      type: GraphQLInt,
      resolve(parent, args, context, info) {
        return Math.floor(parent.duration * 1000);
      },
    },
    signedUrl: {
      type: GraphQLString,
      async resolve(parent, args, context, info) {
        var d1 = new Date();
        d1.toUTCString();
        if (
          parent.signedUrl &&
          parent.lastFetched &&
          parent.lastFetched + 60 * 30 < Math.floor(d1.getTime() / 1000)
        ) {
          return parent.signedUrl;
        }
        const file = await File.findById(parent._id);
        file.signedUrl = await getFile(parent._id + parent.fileExtension);
        file.lastFetched = Math.floor(d1.getTime() / 1000);
        await file.save();
        return file.signedUrl;
      },
    },
    filePath: {
      type: GraphQLString,
      resolve(parent, args, context, info) {
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
      resolve(parent, args, context, info) {
        return parent.posts.length;
      },
    },
    posts: {
      type: new GraphQLList(PostType),
      async resolve(parent, args, context, info) {
        return await Post.find({ _id: { $in: parent.posts } });
      },
    },
    isFollowedByUser: {
      type: GraphQLBoolean,
      resolve(parent, args, context, info) {
        if (!context.profile || !context.profile.id || !parent.followers)
          return false;
        if (parent.followers instanceof Map) {
          const index = parent.followers.get(context.profile.id);
          return index === "1";
        }
        const index = parent.followers[context.profile.id];
        return index === "1";
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
      async resolve(parent, args, context, info) {
        return await Tag.findById(parent.tag);
      },
    },
    count: {
      type: GraphQLInt,
      resolve(parent, args, context, info) {
        return parent.posts.length;
      },
    },
    posts: {
      type: new GraphQLList(PostType),
      async resolve(parent, args, context, info) {
        return await Post.find({ _id: { $in: parent.posts } });
      },
    },
  }),
});

module.exports = {
  UserPublicType,
  UserPrivateType,
  MessageType,
  PostType,
  TagsType,
  FileType,
  PromptsType,
  CommentType,
  ProfilePrivateType,
  ProfilePublicType,
  ChatType,
  ChatMessageType,
  NotifType,
  FilterType,
};

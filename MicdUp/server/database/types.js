const graphql = require("graphql"); //use graphql package
const { User } = require("../database/models/User");
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

const PostType = new GraphQLObjectType({
  name: "Post",
  fields: () => ({
    id: { type: GraphQLID },
    owner: {
      type: GraphQLID,
      async resolve(parent) {
        return await User.findById(parent.owner);
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
module.exports = { UserType, MessageType, PostType };

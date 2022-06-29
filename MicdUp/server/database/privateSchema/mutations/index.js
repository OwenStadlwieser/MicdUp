const graphql = require("graphql"); //use graphql package
/*
 Getting GraphQLObjectType function from 'graphql' to define the (dataType) 
 structure of our queries and their model type.
*/
const { GraphQLObjectType, GraphQLID } = graphql;

const {
  createRecording,
  uploadBio,
  likePost,
  deletePost,
  commentToPost,
  addListenerAuthenticated,
} = require("./recording");
const { deleteAccount } = require("./user");
const {
  updateProfilePic,
  followProfile,
  addToPrivates,
  followTopic,
  blockProfile,
} = require("./profile");
const { addToken } = require("./notifs");
const { likeComment, deleteComment } = require("./comment");

const { fetchChat } = require("./chat");
const Mutation = new GraphQLObjectType({
  name: "MutationType",
  fields: {
    createRecording,
    uploadBio,
    likePost,
    deletePost,
    commentToPost,
    deleteAccount,
    updateProfilePic,
    followProfile,
    addToken,
    likeComment,
    fetchChat,
    deleteComment,
    addToPrivates,
    addListenerAuthenticated,
    followTopic,
    blockProfile,
  }, //fields end here
});

module.exports = Mutation;

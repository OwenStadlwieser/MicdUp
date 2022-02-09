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
} = require("./recording");
const { verifyEmail, setEmailVerified, deleteAccount } = require("./user");
const { updateProfilePic, followProfile } = require("./profile");
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
    verifyEmail,
    setEmailVerified,
    deleteAccount,
    updateProfilePic,
    followProfile,
    addToken,
    likeComment,
    fetchChat,
    deleteComment,
  }, //fields end here
});

module.exports = Mutation;

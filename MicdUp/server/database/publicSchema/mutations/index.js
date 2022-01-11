const graphql = require("graphql"); //use graphql package
/*
 Getting GraphQLObjectType function from 'graphql' to define the (dataType) 
 structure of our queries and their model type.
*/
const { GraphQLObjectType, GraphQLID } = graphql;
const { createUser, forgotPassChange } = require("./auth");
const {
  forgotPass,
  verifyEmail,
  setEmailVerified,
  deleteAccount,
} = require("./user");
const {
  createRecording,
  uploadBio,
  likePost,
  deletePost,
  commentToPost,
} = require("./recording");
const { likeComment, deleteComment } = require("./comment");
const { updateProfilePic } = require("./profile");

const Mutation = new GraphQLObjectType({
  name: "MutationType",
  fields: {
    createUser,
    forgotPass,
    deleteAccount,
    forgotPassChange,
    createRecording,
    uploadBio,
    likePost,
    likeComment,
    deletePost,
    deleteComment,
    updateProfilePic,
    commentToPost,
    verifyEmail,
    setEmailVerified,
  }, //fields end here
});

module.exports = Mutation;

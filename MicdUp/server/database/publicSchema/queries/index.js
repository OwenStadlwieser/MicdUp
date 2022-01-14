const graphql = require("graphql"); //use graphql package
/*Getting GraphQLObjectType function from 'graphql' to define the (dataType) 
 structure of our queries and their model type.
*/
const { login, forgotPassVerify } = require("./auth");
const { GraphQLObjectType, GraphQLID } = graphql;
const { getUser, searchUsers } = require("./user");
const { searchTags, randomPrompt } = require("./tag");
const {
  getUserPosts,
  getComments,
  getRecordingsFromTag,
} = require("./recording");
const { getReplies } = require("./comment");
const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    login,
    forgotPassVerify,
    getUser,
    searchTags,
    randomPrompt,
    getUserPosts,
    getComments,
    getReplies,
    searchUsers,
    getRecordingsFromTag,
  }, //fields end here
});

module.exports = RootQuery;

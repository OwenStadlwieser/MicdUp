const graphql = require("graphql"); //use graphql package
/*Getting GraphQLObjectType function from 'graphql' to define the (dataType) 
 structure of our queries and their model type.
*/
const { login, forgotPassVerify } = require("./auth");
const { GraphQLObjectType, GraphQLID } = graphql;
const { searchTags, randomPrompt, getPopularTags } = require("./tag");
const {
  getUserPosts,
  getComments,
  getRecordingsFromTag,
} = require("./recording");
const { searchUsers } = require("./user");
const { getReplies } = require("./comment");
const { getFilters } = require("./filter");
const { getFollowers, getFollowing } = require("./profile");
const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    login,
    forgotPassVerify,
    getFollowers,
    getFollowing,
    searchTags,
    randomPrompt,
    getUserPosts,
    getComments,
    getReplies,
    getRecordingsFromTag,
    getFilters,
    searchUsers,
    getPopularTags,
  }, //fields end here
});

module.exports = RootQuery;

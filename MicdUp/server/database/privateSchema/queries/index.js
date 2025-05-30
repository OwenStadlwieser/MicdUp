const graphql = require("graphql"); //use graphql package
/*Getting GraphQLObjectType function from 'graphql' to define the (dataType) 
 structure of our queries and their model type.
*/

const { GraphQLObjectType, GraphQLID } = graphql;
const { fetchChats, fetchChatMessages } = require("./chat");
const { getUser } = require("../../privateSchema/queries/user");
const { getPrivates } = require("./profile");
const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    fetchChatMessages,
    fetchChats,
    getUser,
    getPrivates,
  }, //fields end here
});

module.exports = RootQuery;

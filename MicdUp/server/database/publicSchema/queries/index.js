const graphql = require("graphql"); //use graphql package
/*Getting GraphQLObjectType function from 'graphql' to define the (dataType) 
 structure of our queries and their model type.
*/
const { login, forgotPassVerify } = require("./auth");
const { GraphQLObjectType, GraphQLID } = graphql;
const { getUser } = require("./user");
const { searchTags } = require("./tag");
const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: { login, forgotPassVerify, getUser, searchTags }, //fields end here
});

module.exports = RootQuery;

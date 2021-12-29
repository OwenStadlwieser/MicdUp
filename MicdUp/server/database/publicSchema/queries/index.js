const graphql = require("graphql"); //use graphql package
/*Getting GraphQLObjectType function from 'graphql' to define the (dataType) 
 structure of our queries and their model type.
*/
const { getUser } = require("./user");
const { login } = require("./auth");
const { GraphQLObjectType, GraphQLID } = graphql;

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: { getUser, login }, //fields end here
});

module.exports = RootQuery;

const graphql = require("graphql"); //use graphql package
/*Getting GraphQLObjectType function from 'graphql' to define the (dataType) 
 structure of our queries and their model type.
*/
const { GraphQLObjectType, GraphQLID } = graphql;
const { createUser } = require("./auth");
const Mutation = new GraphQLObjectType({
  name: "MutationType",
  fields: { createUser }, //fields end here
});

module.exports = Mutation;

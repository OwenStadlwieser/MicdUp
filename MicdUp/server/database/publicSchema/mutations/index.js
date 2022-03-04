const graphql = require("graphql"); //use graphql package
/*
 Getting GraphQLObjectType function from 'graphql' to define the (dataType) 
 structure of our queries and their model type.
*/
const { GraphQLObjectType, GraphQLID } = graphql;
const { createUser, forgotPassChange } = require("./auth");
const { forgotPass } = require("./user");
const { addListener } = require("./recording");
const Mutation = new GraphQLObjectType({
  name: "MutationType",
  fields: {
    createUser,
    forgotPass,
    forgotPassChange,
    addListener,
  }, //fields end here
});

module.exports = Mutation;

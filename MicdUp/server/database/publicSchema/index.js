const { GraphQLSchema } = require("graphql");

const Queries = require("./queries/index");
const Mutations = require("./mutations/index");

module.exports = new GraphQLSchema({
  query: Queries,
  mutation: Mutations,
});

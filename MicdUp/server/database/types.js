const graphql = require("graphql"); //use graphql package

const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema,
  GraphQLList,
  GraphQLBoolean,
  GraphQLFloat,
} = graphql;

const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    phone: { type: GraphQLString },
    date: { type: GraphQLInt },
    type: {
      type: GraphQLString,
      resolve(parent) {
        return parent.__t;
      },
    },
  }),
});

module.exports = { UserType };

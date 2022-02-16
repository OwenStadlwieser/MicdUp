const { User } = require("../../models/User");
const { Profile } = require("../../models/Profile");
const { ProfilePrivateType } = require("../../types");
const {
  GraphQLList,
  GraphQLString,
  GraphQLInt,
  GraphQLID,
} = require("graphql");

const getPrivates = {
  type: ProfilePrivateType,
  args: { skipMult: { type: GraphQLInt } },
  async resolve(parent, { skipMult }, context) {
    try {
      context.skipMult = skipMult * 20;
      const profile = await Profile.findById(context.profile.id);
      return profile;
    } catch (err) {
      console.log(err);
    }
  },
};

module.exports = {
  getPrivates,
};

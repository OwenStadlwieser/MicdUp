const { User } = require("../../models/User");
const { Profile } = require("../../models/Profile");
const { ProfilePublicType } = require("../../types");
const {
  GraphQLList,
  GraphQLString,
  GraphQLInt,
  GraphQLID,
} = require("graphql");

const getFollowers = {
  type: ProfilePublicType,
  args: { profileId: { type: GraphQLID }, skipMult: { type: GraphQLInt } },
  async resolve(parent, { profileId, skipMult }, context) {
    try {
      context.skipMult = skipMult * 20;
      const profile = await Profile.findById(profileId);
      return profile;
    } catch (err) {
      console.log(err);
    }
  },
};

const getFollowing = {
  type: ProfilePublicType,
  args: { profileId: { type: GraphQLID }, skipMult: { type: GraphQLInt } },
  async resolve(parent, { profileId, skipMult }, context) {
    try {
      context.skipMult = skipMult * 20;
      const profile = await Profile.findById(profileId);
      return profile;
    } catch (err) {
      console.log(err);
    }
  },
};

module.exports = {
  getFollowers,
  getFollowing,
};

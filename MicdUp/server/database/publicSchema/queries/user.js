const { User } = require("../../models/User");
const { UserPublicType } = require("../../types");
const { GraphQLList, GraphQLString, GraphQLInt } = require("graphql");
const searchUsers = {
  type: new GraphQLList(UserPublicType),
  args: { searchTerm: { type: GraphQLString }, skipMult: { type: GraphQLInt } },
  async resolve(parent, { searchTerm, skipMult }, context) {
    try {
      const size = 20;
      const res = await User.aggregate([
        {
          $match: {
            userName: { $regex: new RegExp(searchTerm), $options: "i" },
          },
        },
        {
          $lookup: {
            from: "profiles",
            localField: "profile",
            foreignField: "user",
            as: "profileDoc",
          },
        },
        {
          $project: {
            followers_count: {
              $size: { $ifNull: ["$profileDoc.followers", []] },
            },
            userName: 1,
            profile: 1,
          },
        },
        { $sort: { followers_count: 1 } },
        { $project: { _id: 1, userName: 1, profile: 1, followers_count: 1 } },
      ])
        .skip(size * skipMult)
        .limit(size);

      return res;
    } catch (err) {
      console.log(err);
    }
  },
};

module.exports = {
  searchUsers,
};

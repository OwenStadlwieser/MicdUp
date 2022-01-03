const { Tag } = require("../../models/Tag");
const { UserType, TagsType } = require("../../types");
const { GraphQLList, GraphQLString } = require("graphql");
const searchTags = {
  type: new GraphQLList(TagsType),
  args: { searchTerm: { type: GraphQLString } },
  async resolve(parent, { searchTerm }, context) {
    try {
      const res = await Tag.aggregate([
        { $match: { $text: { $search: searchTerm } } },
        {
          $addFields: {
            totalScore: {
              $add: [{ $meta: "textScore" }, { $divide: ["$count", 1000] }],
            },
          },
        },
        {
          $sort: { totalScore: -1 },
        },
      ]);
      return res;
    } catch (err) {
      console.log(err);
    }
  },
};

module.exports = {
  searchTags,
};

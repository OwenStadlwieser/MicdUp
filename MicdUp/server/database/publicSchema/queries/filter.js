const { Filter } = require("../../models/Filter");
const { FilterType } = require("../../types");
const { GraphQLList, GraphQLInt } = require("graphql");

const getFilters = {
  type: new GraphQLList(FilterType),
  args: { skipMult: { type: GraphQLInt } },
  async resolve(parent, { skipMult }, context) {
    const size = 30;
    try {
      const res = await Filter.aggregate([
        {
          $addFields: {
            posts_count: {
              $size: { $ifNull: ["$posts", []] },
            },
          },
        },
        { $sort: { posts_count: 1 } },
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
  getFilters,
};

const { Tag } = require("../../models/Tag");
const { Prompt } = require("../../models/Prompt");
const { UserType, TagsType, PromptsType } = require("../../types");
const { GraphQLList, GraphQLString } = require("graphql");

const searchTags = {
  type: new GraphQLList(TagsType),
  args: { searchTerm: { type: GraphQLString } },
  async resolve(parent, { searchTerm }, context) {
    try {
      const res = await Tag.aggregate([
        {
          $match: {
            title: { $regex: new RegExp(searchTerm), $options: "i" },
          },
        },
        {
          $addFields: {
            totalScore: {
              $add: [0, { $divide: ["$count", 1000] }],
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

const randomPrompt = {
  type: PromptsType,
  args: {},
  async resolve(parent, {}, context) {
    try {
      const res = await Prompt.aggregate([
        {
          $sample: { size: 1 },
        },
      ]);
      console.log(res);
      return res[0];
    } catch (err) {
      console.log(err);
    }
  },
};

module.exports = {
  searchTags,
  randomPrompt,
};

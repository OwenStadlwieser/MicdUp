const { Tag } = require("../../models/Tag");
const { Prompt } = require("../../models/Prompt");
const { TagsType, PromptsType } = require("../../types");
const { GraphQLList, GraphQLString } = require("graphql");

const getPopularTags = {
  type: new GraphQLList(TagsType),
  async resolve(parent, {}, context) {
    try {
      //TODO replace count with a 24hr count
      const res = await Tag.aggregate([
        {
          $addFields: {
            totalScore: {
              $add: ["$hr24searches", { $divide: ["$count", 1000] }],
            },
          },
        },
        {
          $sort: { totalScore: -1 },
        },
      ]).limit(20);
      return res;
    } catch (err) {
      console.log(err);
    }
  },
};

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
      return res[0];
    } catch (err) {
      console.log(err);
    }
  },
};

module.exports = {
  searchTags,
  randomPrompt,
  getPopularTags,
};

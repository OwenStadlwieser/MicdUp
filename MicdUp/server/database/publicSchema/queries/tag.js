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

const getRecommendedTags = {
  type: new GraphQLList(TagsType),
  async resolve(parent, {}, context) {
    try {
      //TODO replace count with a 24hr count
      if (!context.user) {
        let res = [];
        while (res.length < 15) {
          const randomTag = await Tag.aggregate([
            {
              $sample: { size: 1 },
            },
          ]);
          if (
            res.findIndex((el) => {
              return (el._id.toString() === randomTag._id) < 0;
            })
          ) {
            res.push(randomTag[0]);
          }
        }
        return res;
      } else {
        const likedTagsMap = context.profile.likedTags;
        // Create items array
        var items = Object.keys(likedTagsMap).map(function (key) {
          return [key, likedTagsMap[key]];
        });

        // Sort the array based on the second element
        items.sort(function (first, second) {
          return second[1] - first[1];
        });

        // Create a new array with only the first 5 items
        var keyValuePairs = items.slice(0, 20);
        var list = keyValuePairs.map((el) => el[0]);
        var stack = [];
        for (var i = list.length - 1; i > 0; i--) {
          var rec = {
            $cond: [{ $eq: ["$_id", list[i - 1]] }, i],
          };

          if (stack.length == 0) {
            rec["$cond"].push(i + 1);
          } else {
            var lval = stack.pop();
            rec["$cond"].push(lval);
          }

          stack.push(rec);
        }
        var pipeline = [
          { $match: { _id: { $in: list } } },
          { $project: { weight: stack[0] } },
          { $sort: { weight: 1 } },
        ];
        const res = await Tag.aggregate(pipeline);
        while (res.length < 15) {
          const randomTag = await Tag.aggregate([
            {
              $sample: { size: 1 },
            },
          ]);
          if (
            res.findIndex((el) => {
              return el._id.toString() === randomTag._id;
            }) < 0
          ) {
            res.push(randomTag[0]);
          }
        }
        return res;
      }
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
  getRecommendedTags,
};

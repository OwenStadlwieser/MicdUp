const { Tag } = require("../../models/Tag");
const { UserType, TagsType } = require("../../types");
const { GraphQLList, GraphQLString } = require("graphql");
const searchTags = {
  type: new GraphQLList(TagsType),
  args: { searchTerm: { type: GraphQLString } },
  async resolve(parent, { searchTerm }, context) {
    try {
      const res = await Tag.find({ $text: { $search: searchTerm } }).sort({
        score: { $add: [{ $meta: "textScore" }, "$count"] },
      });
      console.log(res);
      return res;
    } catch (err) {}
  },
};

module.exports = {
  searchTags,
};

const { Post } = require("../../models/Post");
const { Tag } = require("../../models/Tag");
const { Comment } = require("../../models/Comment");
const { Notif } = require("../../models/Notif");
const { NotifType, NotifQueryType } = require("../../types");
const { GraphQLList, GraphQLInt } = require("graphql");

const getUserNotifs = {
  type: NotifQueryType,
  args: { skipMult: { type: GraphQLInt } },
  async resolve(parent, { skipMult }, context) {
    try {
      const size = 20;
      let blocked = [];
      let blockedBy = [];
      if (context.profile) {
        blocked = [...context.profile.blockedMap.keys()];
        blockedBy = [...context.profile.blockedByMap.keys()];
      }
      const notifsUnseen = await Notif.find({
        $and: [
          {
            receiver: context.profile._id,
          },
          { sender: { $nin: blocked } },
          { sender: { $nin: blockedBy } },
          { $or: [{ seenByUser: false }, { seenByUser: { $exists: false } }] },
        ],
      });
      const notifs = await Notif.find({
        $and: [
          {
            receiver: context.profile._id,
          },
          { sender: { $nin: blocked } },
          { sender: { $nin: blockedBy } },
        ],
      })
        .sort({ dateCreated: -1 })
        .skip(size * skipMult)
        .limit(size);
      let sizeOfUnseen = notifsUnseen ? notifsUnseen.length : 0;
      return { notifs, numberOfUnseenNotifs: sizeOfUnseen };
    } catch (err) {
      console.log(err);
    }
  },
};

module.exports = {
  getUserNotifs,
};

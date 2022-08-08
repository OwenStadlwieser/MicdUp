const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// Create Schema
const ProfileSchema = new Schema({
  following: {
    type: mongoose.Schema.Types.Map,
    of: String,
    default: new Map(),
  },
  blockedMap: {
    type: mongoose.Schema.Types.Map,
    of: String,
    default: new Map(),
  },
  blockedByMap: {
    type: mongoose.Schema.Types.Map,
    of: String,
    default: new Map(),
  },
  followingTopics: {
    type: mongoose.Schema.Types.Map,
    of: String,
    default: new Map(),
  },
  followers: {
    type: mongoose.Schema.Types.Map,
    of: String,
    default: new Map(),
  },
  likedTags: {
    type: mongoose.Schema.Types.Map,
    of: Number,
    default: new Map(),
  },
  chats: {
    type: [mongoose.Schema.Types.ObjectId],
    default: [],
  },
  privates: {
    type: mongoose.Schema.Types.Map,
    of: String,
    default: new Map(),
  },
  posts: {
    type: [mongoose.Schema.Types.ObjectId],
  },
  searchedTags: {
    type: [mongoose.Schema.Types.ObjectId],
  },
  image: {
    type: mongoose.Schema.Types.ObjectId,
  },
  bio: {
    type: mongoose.Schema.Types.ObjectId,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
    unique: true,
  },
});

// ProfileSchema.post("find", async function (results) {
//   const loggedInUser = contextService.get("request")
//     ? contextService.get("request").user
//     : null;
//   if (loggedInUser) {
//     for (let i = 0; i < results.length; i++) {
//       const blockedIndex = results[i].blockedMap.get(`${loggedInUser.profile}`);
//       if (blockedIndex === "1") {
//         delete results[i];
//       }
//     }
//   }
//   return results.filter((el) => el);
// });

const Profile = mongoose.model("profiles", ProfileSchema);
module.exports = { Profile, ProfileSchema };

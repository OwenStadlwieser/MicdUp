const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const ProfileSchema = new Schema({
  following: {
    type: mongoose.Schema.Types.Map,
    of: String,
    default: new Map(),
  },
  followers: {
    type: mongoose.Schema.Types.Map,
    of: String,
    default: new Map(),
  },
  chats: {
    type: [mongoose.Schema.Types.ObjectId],
  },
  blocked: {
    type: [mongoose.Schema.Types.ObjectId],
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

const Profile = mongoose.model("profiles", ProfileSchema);

module.exports = { Profile };

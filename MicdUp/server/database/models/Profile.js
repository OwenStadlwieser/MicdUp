const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const ProfileSchema = new Schema({
  following: {
    type: [mongoose.Schema.Types.ObjectId],
  },
  followers: {
    type: [mongoose.Schema.Types.ObjectID],
  },
  blocked: {
    type: [mongoose.Schema.Types.ObjectId],
  },
  posts: {
    type: [mongoose.Schema.Types.ObjectId],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
    unique: true,
  },
});

const Profile = mongoose.model("profiles", ProfileSchema);

module.exports = { Profile };

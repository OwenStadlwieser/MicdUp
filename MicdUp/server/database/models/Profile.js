const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const ProfileSchema = new Schema({
  following: {
    type: [mongoose.Types.ObjectId],
  },
  followers: {
    type: [mongoose.Types.ObjectID],
  },
  blocked: {
    type: [mongoose.Types.ObjectId],
  },
  posts: {
    type: [mongoose.Types.ObjectId],
  },
  user: {
    type: mongoose.Types.ObjectId,
    require: true,
    unique: true,
  },
});

const Profile = mongoose.model("profiles", ProfileSchema);

module.exports = { Profile };

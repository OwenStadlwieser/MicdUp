const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const commentSchema = new Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  likers: {
    type: [mongoose.Schema.Types.ObjectId],
    default: [],
  },
  replies: {
    type: [mongoose.Schema.Types.ObjectId],
  },
  likes: {
    type: Number,
  },
  text: {
    type: String,
    default: "",
  },
  fileExtension: {
    type: String,
  },
  signedUrl: {
    type: String,
  },
  lastFetched: {
    type: Date,
  },
  isTop: {
    type: Boolean,
    default: false,
  },
  ultimateParent: {
    type: mongoose.Schema.Types.ObjectId,
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
});

const Comment = mongoose.model("comments", commentSchema);

module.exports = { Comment };

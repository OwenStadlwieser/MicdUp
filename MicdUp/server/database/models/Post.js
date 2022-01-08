const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const postSchema = new Schema({
  nsfw: {
    type: Boolean,
    default: false,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  likers: {
    type: [mongoose.Schema.Types.ObjectId],
  },
  comments: {
    type: [mongoose.Schema.Types.ObjectId],
  },
  likes: {
    type: Number,
  },
  title: {
    type: String,
    required: true,
  },
  allowStitch: {
    type: Boolean,
    default: false,
    required: true,
  },
  allowRebuttal: {
    type: Boolean,
    default: false,
    required: true,
  },
  privatePost: {
    type: Boolean,
    default: false,
    required: true,
  },
  fileExtension: {
    type: String,
    required: true,
  },
  signedUrl: {
    type: String,
  },
  lastFetched: {
    type: Date,
  },
  tags: {
    type: [mongoose.Schema.Types.ObjectId],
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
});

const Post = mongoose.model("posts", postSchema);

module.exports = { Post };

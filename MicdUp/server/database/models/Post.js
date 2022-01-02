const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const postSchema = new Schema({
  nsfw: {
    type: Boolean,
    default: false,
  },
  owner: {
    type: mongoose.Types.ObjectId,
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
  hashTags: {
    type: [mongoose.Types.ObjectId],
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
});

const Post = mongoose.model("posts", postSchema);

module.exports = { Post };

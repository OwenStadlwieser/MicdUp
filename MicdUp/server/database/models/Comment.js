const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const commentSchema = new Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  post: {
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
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

commentSchema.pre("save", async function (next) {
  if (this.isModified("isDeleted") && this.isDeleted) {
    this.fileExtension = "";
    this.text = "";
    this.signedUrl = "";
  }
  next();
});

const Comment = mongoose.model("comments", commentSchema);

module.exports = { Comment };

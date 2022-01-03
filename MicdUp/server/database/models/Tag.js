const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const tagsSchema = new Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  count: {
    type: Number,
    required: true,
    default: 0,
  },
  posts: {
    type: [mongoose.Schema.Types.ObjectId],
    required: true,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
});

const Tag = mongoose.model("tag", tagsSchema);

tagsSchema.index({ title: "text", description: "text" });

module.exports = { Tag };

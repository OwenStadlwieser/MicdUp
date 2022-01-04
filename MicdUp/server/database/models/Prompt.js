const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const promptsSchema = new Schema({
  prompt: {
    type: String,
    required: true,
    unique: true,
  },
  tag: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  posts: {
    type: [mongoose.Schema.Types.ObjectId],
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
});

const Prompt = mongoose.model("prompt", promptsSchema);

module.exports = { Prompt };

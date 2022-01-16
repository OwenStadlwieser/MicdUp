const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const chatSchema = new Schema({
  members: {
    type: [mongoose.Schema.Types.ObjectId],
    required: true,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  messages: {
    type: [mongoose.Schema.Types.ObjectId],
    default: [],
  },
  likers: {
    type: mongoose.Schema.Types.Map,
    of: String,
    default: new Map(),
  },
});

const Chat = mongoose.model("chat", chatSchema);

module.exports = { Chat };

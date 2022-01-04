const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const bioSchema = new Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
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
  dateCreated: {
    type: Date,
    default: Date.now,
  },
});

const Bio = mongoose.model("bio", bioSchema);

module.exports = { Bio };

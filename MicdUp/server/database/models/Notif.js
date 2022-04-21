const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { getCurrentTime } = require("../../reusableFunctions/helpers");

// Create Schema
const options = { discriminatorKey: "kind" };
const notifSchema = new Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    image: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
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
  },
  options
);

module.exports = { notifSchema };

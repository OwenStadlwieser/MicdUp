const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { getCurrentTime } = require("../../reusableFunctions/helpers");

// Create Schema
const filterSchema = new Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["DISTORTION", "PITCH", "EQUALIZER", "REVERB", "ALL"],
  },
  posts: {
    type: [mongoose.Schema.Types.ObjectId],
  },
  image: {
    type: mongoose.Schema.Types.ObjectId,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
  searches: {
    type: Number,
    default: 0,
  },
  hr24searches: {
    type: Number,
    default: 0,
  },
  reverbPreset: {
    type: Number,
    default: 0,
    max: 12,
    min: 0,
  },
  reverb: {
    type: Number,
    default: 0,
  },
  distortionPreset: {
    type: Number,
    default: 0,
    max: 21,
    min: 0,
  },
  distortion: {
    type: Number,
    default: 0,
  },
  equalizerPreset: {
    type: Number,
    default: 0,
    max: 10,
    min: 0,
  },
  pitchNum: {
    type: Number,
    default: 0,
  },
});

const Filter = mongoose.model("filter", filterSchema);

module.exports = { Filter };

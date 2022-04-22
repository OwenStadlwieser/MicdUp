const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { getCurrentTime } = require("../../reusableFunctions/helpers");
const { getFilteredResults } = require("../../utils/securityHelpers");

// Create Schema
const options = { discriminatorKey: "kind" };
const fileSchema = new Schema(
  {
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
    speechToText: [
      {
        word: {
          type: String,
        },
        time: {
          type: Number,
        },
      },
    ],
  },
  options
);

// fileSchema.post("find", async function (result) {
//   let res = await getFilteredResults(result, true);
//   return res;
// });

const File = mongoose.model("file", fileSchema);
const Message = File.discriminator(
  "message",
  new Schema(
    {
      seenBy: {
        type: mongoose.Schema.Types.ObjectId,
      },
    },
    options
  )
);

module.exports = { File, Message };

var cron = require("node-cron");
var mongoose = require("mongoose");
const { Tag } = require("../database/models/Tag");
var resetSearches = cron.schedule(
  "0 0 0 * * *",
  async () => {
    //will run every day at 12:00 AM
    console.log("resetting searches");
    await Tag.updateMany({}, { hr24searches: 0 });
  },
  {
    scheduled: false,
  }
);

module.exports = { resetSearches };

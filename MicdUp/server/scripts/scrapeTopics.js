const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const fs = require("fs");
const AdblockerPlugin = require("puppeteer-extra-plugin-adblocker");
const dotenv = require("dotenv");
// add stealth plugin and use defaults (all evasion techniques)
dotenv.config({ path: `${__dirname}/../config.env` });
const { Tag } = require("../database/models/Tag");
const { Prompt } = require("../database/models/Prompt");
const mongoose = require("mongoose");
const { getCurrentTime } = require("../reusableFunctions/helpers");
let db = process.env.DATABASE.replace("<DB_PASSWORD>", process.env.DB_PASSWORD);
db = db.replace("<DB_USERNAME>", process.env.DB_USERNAME);
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((connected) => {
    (async () => {
      // let rawdata = fs.readFileSync('json/nflWeek1BearsVsRams.json');
      // let players = JSON.parse(rawdata);
      // console.log(players);
      let players = {};
      puppeteer.use(StealthPlugin());
      puppeteer.use(AdblockerPlugin());
      const browser = await puppeteer.launch({ headless: false });
      const context = browser.defaultBrowserContext();
      await context.overridePermissions(
        "https://chercher.tech/practice/geo-location",
        ["geolocation"]
      );
      const page = await browser.newPage();
      await page.setGeolocation({
        latitude: 53.544388,
        longitude: -113.490929,
      });
      await page.goto(
        "https://thepleasantconversation.com/topics-to-talk-about/"
      );
      let defenses = {};
      let tags = await page.$x(`//h3`);
      let prompts = await page.$x(`//ul`);
      const session = await mongoose.startSession();
      session.startTransaction();
      let i = 4;
      try {
        while (i < tags.length - 1) {
          let textContent = await (
            await tags[i].getProperty("textContent")
          ).jsonValue();
          let stringValue = new String(textContent);
          stringValue = stringValue.toString();
          stringValue = stringValue
            .replace(/[^a-z0-9]/gim, "")
            .replace(/\s+/g, "")
            .replace(/[0-9]/g, "");
          const tag = new Tag({
            title: stringValue,
            dateCreated: getCurrentTime(),
          });
          let prompts = await page.$x(`//ul[${i + 1}]/li`);
          if (prompts.length === 0) {
            i = i + 1;
            continue;
          }

          for (let j = 0; j < prompts.length; j++) {
            let pTextContent = await (
              await prompts[j].getProperty("textContent")
            ).jsonValue();
            let pStringValue = new String(pTextContent);
            pStringValue = pStringValue.toString();
            const prompt = new Prompt({ tag: tag._id, prompt: pStringValue });
            await prompt.save({ session });
          }
          await tag.save({ session });
          i = i + 1;
        }
        await session.commitTransaction();
      } catch (err) {
        console.log(err);
        await session.abortTransaction();
      } finally {
        session.endSession();
      }
    })();
  })
  .catch((err) => console.log(err));

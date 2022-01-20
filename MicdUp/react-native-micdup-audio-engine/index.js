// main index.js

const { NativeModules, Platform } = require("react-native");

const { AudioEngine } = NativeModules;

if (Platform.OS === "ios") {
  module.exports = {
    log: function () {
      console.log("ios");
    },
    AudioEngine,
  };
} else {
  module.exports = {
    log: function () {
      console.log("notios");
    },
  };
}

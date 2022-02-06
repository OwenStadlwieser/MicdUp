// main index.js

const { NativeModules, Platform } = require("react-native");

const { AudioEngine } = NativeModules;

if (Platform.OS === "ios") {
  module.exports = {
    log: function () {},
    AudioEngine,
  };
} else {
  module.exports = {
    log: function () {},
  };
}

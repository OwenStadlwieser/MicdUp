const getCurrentTime = () => {
  var d1 = new Date();
  d1.toUTCString();
  return Math.floor(d1.getTime() / 1000);
};

module.exports = { getCurrentTime };

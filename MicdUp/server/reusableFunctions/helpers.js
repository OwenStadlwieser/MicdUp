const getCurrentTime = () => {
  var d1 = new Date();
  d1.toUTCString();
  console.log(Math.floor(d1.getTime()), 1234);
  return Math.floor(d1.getTime());
};

module.exports = { getCurrentTime };

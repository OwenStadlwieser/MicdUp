const { UserType } = require("../../types");
const getUser = {
  type: UserType,
  args: {},
  async resolve(parent, {}, context) {
    try {
      return context.user;
    } catch (err) {
      console.log(err);
    }
  },
};

module.exports = {
  getUser,
};

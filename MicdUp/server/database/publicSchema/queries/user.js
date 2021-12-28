const { User } = require("../../models/User");
const { UserType } = require("../../types");
const getUser = {
  type: UserType,
  args: {},
  async resolve(parent, {}, context) {
    try {
      return await User.findById(context.user.id);
    } catch (err) {
      console.log(err);
    }
  },
};

module.exports = {
  getUser,
};

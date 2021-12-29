const { User } = require("../../models/User");
const { GraphQLString } = require("graphql");
const { MessageType } = require("../../types");

const createUser = {
  type: MessageType,
  args: {
    email: { type: GraphQLString },
    phone: { type: GraphQLString },
    user: { type: GraphQLString },
    password: { type: GraphQLString },
    dob: { type: GraphQLString },
  },
  async resolve(parent, { email, phone, password, user, dob }, context) {
    // FIXME: implement transaction
    returnObject = {
      success: true,
      message: "Sign up successful",
    };
    try {
      await User.create({
        userName: user,
        phone,
        email,
        password,
        dob,
      });
    } catch (err) {
      returnObject.success = false;
      returnObject.message = err.message;
    }
    return returnObject;
  },
};

module.exports = {
  createUser,
};

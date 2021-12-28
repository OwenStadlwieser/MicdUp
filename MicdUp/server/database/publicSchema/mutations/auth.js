const { User } = require("../../models/User");
const { GraphQLString } = require("graphql");
const { UserType } = require("../../types");

const createUser = {
  type: UserType,
  args: {
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    password: { type: GraphQLString },
    phone: { type: GraphQLString },
  },
  async resolve(parent, { name, email, password, phone }, context) {
    // FIXME: implement transaction
    const userAlreadyExists = await User.findOne({
      $or: [{ email: email }, { phone: phone }],
    });
    if (userAlreadyExists) {
      throw new Error("duplicate user found");
    }
    let user = User.insertMany({
      name,
      phone,
      email,
      password,
    });
    return user;
  },
};

module.exports = {
  createUser,
};

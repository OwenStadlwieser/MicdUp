const { User } = require("../database/models/User");

const initUsers = async (options) => {
  await User.create({
    userName: "user",
    phone: "1111111111",
    email: "TestUser1@gmail.com",
    password: "Test1234!",
    dob: Date.now(),
  });
  await User.create({
    userName: "user2",
    phone: "2222222222",
    email: "TestUser2@gmail.com",
    password: "Test1234!",
    dob: Date.now(),
  });
  await User.create({
    userName: "user3",
    phone: "2222222223",
    email: "TestUser3@gmail.com",
    password: "Test1234!",
    dob: Date.now(),
  });
};

module.exports = { initUsers };

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const Schema = mongoose.Schema;

// Create Schema
const UserSchema = new Schema({
  userName: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  resetPasswordToken: {
    type: String,
    unique: true,
    sparse: true,
  },
  resetPasswordCreatedAt: {
    type: Date,
  },
  dob: {
    type: Date,
    required: true,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
});

UserSchema.methods.getPasswordResetToken = async function () {
  let resetToken = crypto.randomBytes(5).toString("hex");
  let user = await User.find({ resetPasswordToken: resetToken });
  while (user && Object.keys(user).length !== 0) {
    resetToken = crypto.randomBytes(5).toString("hex");
    user = await User.find({ resetPasswordToken: resetToken });
  }
  this.resetPasswordToken = resetToken;
  this.resetPasswordCreatedAt = Date.now();
  return resetToken;
};
UserSchema.pre("save", async function (next) {
  if (this.isModified("password") && this.password) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});
const User = mongoose.model("users", UserSchema);

module.exports = { User };

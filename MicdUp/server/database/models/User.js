const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const Schema = mongoose.Schema;
const { getCurrentTime } = require("../../reusableFunctions/helpers");

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
  verifyEmailToken: {
    type: String,
    unique: true,
    sparse: true,
  },
  verifyEmailCreatedAt: {
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
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  pushTokens: {
    type: mongoose.Schema.Types.Array,
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
  this.resetPasswordCreatedAt = getCurrentTime();
  return resetToken;
};

UserSchema.methods.getVerifiedEmailToken = async function () {
  let emailToken = crypto.randomBytes(5).toString("hex");
  let user = await User.find({ verifyEmailToken: emailToken });
  while (user && Object.keys(user).length !== 0) {
    emailToken = crypto.randomBytes(5).toString("hex");
    user = await User.find({ verifyEmailToken: emailToken });
  }
  this.verifyEmailToken = emailToken;
  this.verifyEmailCreatedAt = getCurrentTime();
  return emailToken;
};

UserSchema.pre("save", async function (next) {
  if (this.isModified("userName") && this.userName) {
    const regex = new RegExp("^[a-zA-z][a-zA-Z0-9]+$");
    if (!regex.test(this.username)) {
      throw new Error("Username is invalid");
    }
  }
  if (this.isModified("email") && this.email) {
    if (
      !this.email.match(
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      )
    ) {
      throw new Error("Email is invalid.");
    }
  }
  if (this.isModified("phone") && this.phone) {
    // Matches the following
    // (123) 456-7890
    // (123)456-7890
    // 123-456-7890
    // 123.456.7890
    // 1234567890
    // +31636363634
    // 075-63546725
    const regex = new RegExp(
      "^[+]?[(]?[0-9]{3}[)]?[-s.]?[0-9]{3}[-s.]?[0-9]{4,6}$"
    );
    if (!regex.test(this.phone)) {
      throw new Error("Phone number is invalid.");
    }
  }
  if (this.isModified("password") && this.password) {
    // Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character.
    const regex = new RegExp(
      "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&])[A-Za-z0-9@$!%*?&]{8,}$"
    );
    if (!regex.test(this.password)) {
      throw new Error("Password is invalid.");
    } else {
      this.password = await bcrypt.hash(this.password, 12);
    }
  }
  if (this.isModified("age") && this.dob) {
    var isOldEnough = false;
    let time = Date.parse(this.dob);
    let userDOB = new Date(time);
    const today = new Date();
    var age = today.getFullYear() - userDOB.getFullYear();
    var m = today.getMonth() - userDOB.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < userDOB.getDate())) {
      age--;
    }
    if (age >= 13) {
      isOldEnough = true;
    } else {
      isOldEnough = false;
    }
    if (!isOldEnough) {
      throw new Error("Age is invalid.");
    }
  }
  next();
});
const User = mongoose.model("users", UserSchema);

module.exports = { User };

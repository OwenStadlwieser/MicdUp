const { User } = require("../../models/User");
const { GraphQLString } = require("graphql");
const { MessageType } = require("../../types");
const { sendEmail } = require("../../../utils/sendEmail");

const forgotPass = {
  type: MessageType,
  args: {
    email: { type: GraphQLString },
  },
  async resolve(parent, { email }, context) {
    // FIXME: implement transaction
    let returnObject = {
      success: true,
      message: "Email sent successfully",
    };
    const user = await User.findOne({ email });
    if (!user) {
      returnObject.success = false;
      returnObject.message = "No user found";
      return returnObject;
    }
    const resetToken = await user.getPasswordResetToken();
    await user.save();
    const message = `You are recieving this message because you have requested to
    reset your password. The code to reset your password is ${resetToken}.`;
    try {
      await sendEmail({
        email: user.email,
        subject: "Password Reset Requested",
        message,
      });
    } catch (err) {
      console.log(err);
      returnObject.success = false;
      returnObject.message = err.message;
    }
    return returnObject;
  },
};

module.exports = {
  forgotPass,
};

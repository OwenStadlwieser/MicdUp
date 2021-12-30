const nodemailer = require("nodemailer");
const sendEmail = async (options) => {
  var smtpTransport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASS,
    },
  });
  var mailOptions = {
    from: process.env.SMTP_EMAIL,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  smtpTransport.sendMail(mailOptions, function (error, response) {
    if (error) {
      console.log(error);
    } else {
      res.redirect("/");
    }
  });
};

module.exports = { sendEmail };

const nodemailer = require("nodemailer");
const sendEmail = async (mailOptions) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const Options = {
    to: mailOptions.to,
    from: "noreply@readers-hub.io",
    subject: mailOptions.subject,
    text: mailOptions.message,
  };

  await transporter.sendMail(Options);
};

module.exports = sendEmail;

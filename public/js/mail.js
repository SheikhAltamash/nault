
require("dotenv").config();
const nodemailer = require("nodemailer");
const crypto = require("crypto");

let transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.USER,
    pass: process.env.PASSWORD,
  },
});

function generateOTP() {
  return crypto.randomBytes(3).toString("hex"); // Generates a 6-character OTP
}
const otpSender = async (name,address,otp) => {
  const mailOptions = {
    from: {
      name: "Nault",
      adderess: process.env.USER,
    },
    to: address,
    subject: `Subject: Your OTP for Nault`,
    text: `
Hello ${name},

Thank you for using Nault. To complete your verification process, please use the following One-Time Password (OTP):

Your OTP is: ${otp}

This OTP is valid for the next 10 minutes. Please do not share this OTP with anyone for security reasons.

If you did not request this OTP, please ignore this email or contact our support team immediately.

Best regards,
Nault Support Team
nault.contact@gmail.com
nault.onrender.com
`,
  };

const sendMail = async (transporter, mailOptions) => {
    try {
      await transporter.sendMail(mailOptions);
      console.log("mail has been send successfully to referrer ");
    } catch (e) {
      console.log(e.message);
    }
  };
  sendMail(transporter, mailOptions);
};
const resetOtpsender = async (name, address,otp) => {
  const mailOptions = {
    from: {
      name: "Nault",
      adderess: process.env.USER,
    },
    to: address,
    subject: `Reset Your Password - Nault`,
    text: `Dear ${name},

We received a request to reset your password for your Nault account. Please use the following OTP to reset your password:

OTP: ${otp}

This OTP is valid for the next 10 minutes. Please do not share this OTP with anyone for security reasons.

If you did not request this OTP, please ignore this email or contact our support team immediately.

Best regards,

Nault Support Team
nault.contact@gmail.com
nault.onrender.com
`,
  };
  const sendMail = async (transporter, mailOptions) => {
    try {
      await transporter.sendMail(mailOptions);
      console.log("mail has been send successfully refree");
    } catch (e) {
      console.log(e.message);
    }
  };
  sendMail(transporter, mailOptions);
};
module.exports = { otpSender, resetOtpsender, generateOTP };


require("dotenv").config();
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const hrData = require("./emailData")
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
const notify = async (
  uploader,
  classname,
  addresses,
  filename,
  folder,
  subject,
  folderId
) => {
  const mailOptions = {
    from: {
      name: "Nault",
      address: process.env.USER,
    },
    to: addresses, // Multiple recipients
    subject: `New Notes Uploaded by ${uploader} on Nault`,
    text: `Hi ${classname} Students,
      ${uploader} has just uploaded new notes for "${subject}" in the folder "${folder}".
You can access the file "${filename}" directly through the link below:

https://nault.onrender.com/folder/enter/${folderId}

Happy studying!

Best regards,
The Nault Team
`,
  };

  const sendMail = async (transporter, mailOptions) => {
    try {
      await transporter.sendMail(mailOptions);
      console.log("Notification mail has been sent successfully.");
    } catch (e) {
      console.log(e.message);
    }
  };

  sendMail(transporter, mailOptions);
};

const path = require("path");
const { hrtime } = require("process");

const sendReferralEmail = async (
  hrName,
  hrEmail, 
  
) => {
  const mailOptions = {
    from: {
      name: "Sheikh Altamash",
      address: "nault.org@gmail.com",
    },
    to: hrEmail,
    subject:
      "Seeking Assistance for Suitable Job or Internship Opportunity & Referral",
    text: `Dear ${hrName},

I hope you are doing well.

My name is Sheikh Altamash, and I am in my final year of B.Tech in Computer Science and Engineering at Anjuman College of Engineering and Technology, Nagpur.

I am seeking a full-time role or internship in software development. Recently, I completed a 3-month internship as a Full Stack Developer, contributing to a production-level e-commerce application.

My skills include the MERN stack (MongoDB, Express.js, React.js, Node.js), REST APIs, Firebase, Next.js, and NestJS. I have led hackathon teams and built scalable applications.

I would appreciate it if you could inform me of any relevant openings or refer me to someone in your network.

My resume is attached for your reference. I am happy to provide any additional information if needed.

Thank you for your time and consideration.

Let’s build something impactful together.

Warm regards,  
Sheikh Altamash
Linkedin: linkedin.com/in/sheikhaltamash/  
Contact: 7498399449  
GitHub: github.com/SheikhAltamash
Email: altamashsheikh077@gmail.com
`,
    attachments: [
      {
        filename: "resume.pdf",
        path: path.join(__dirname, "resume.pdf"), // Ensure the file exists
        contentType: "application/pdf",
      },
    ],
  };


    await transporter.sendMail(mailOptions);
    console.log("Referral email sent successfully to HR.", hrName);
 
};

// sendReferralEmail("altamash","altamashsheikh077@gmail.com")


function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callEmail() {
  for (let i = 1647; i <= 1846; i++) {
    const firstName = hrData[i].name.split(" ")[0];
    await sendReferralEmail(firstName, hrData[i].email);
    console.log(`${i + 1}. Email sent to: ${firstName}`);
    await delay(4000);
  }
}
// callEmail()                                                                     
// console.log("hello");
module.exports = { otpSender, resetOtpsender, generateOTP,notify };
// 215309
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");


const app = express();
const PORT = process.env.PORT || 5000;

const submissionsFile = path.join(__dirname, "submissions.json");

app.use(cors());
app.use(express.json());

// ✅ transporter FIRST
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.get("/", (req, res) => {
  res.send("PulseFit backend is running.");
});

// ✅ MAKE ROUTE ASYNC
app.post("/contact", async (req, res) => {
  const { name, email, goal, message } = req.body;

  if (!name || !email || !goal || !message) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const newSubmission = {
    id: Date.now(),
    name,
    email,
    goal,
    message,
    submittedAt: new Date().toISOString(),
  };

  let submissions = [];

  try {
    const fileData = fs.readFileSync(submissionsFile, "utf8");
    submissions = JSON.parse(fileData);
  } catch (error) {
    submissions = [];
  }

  submissions.push(newSubmission);

  fs.writeFileSync(submissionsFile, JSON.stringify(submissions, null, 2));

  // ✅ SEND EMAIL INSIDE ROUTE
try {
  // Email to YOU
  await transporter.sendMail({
    from: `"PulseFit Website" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    subject: "New PulseFit Client",
    text: `
Name: ${name}
Email: ${email}
Goal: ${goal}
Message: ${message}
    `,
  });

  // Confirmation email to USER
  await transporter.sendMail({
    from: `"PulseFit" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "We received your request 💪",
    text: `
Hey ${name},

Thanks for reaching out to PulseFit!

We received your request and will get back to you shortly.

Your goal: ${goal}

Stay strong 💪
PulseFit Team
    `,
  });

  res.status(200).json({ message: "Message sent successfully." });

} catch (error) {
  console.error(error);
  res.status(500).json({ message: "Email failed to send." });
}
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { Resend } = require("resend");



const app = express();
const PORT = process.env.PORT || 5000;

const submissionsFile = path.join(__dirname, "submissions.json");
const resend = new Resend(process.env.RESEND_API_KEY);

app.use(cors());
app.use(express.json());




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
  await resend.emails.send({
    from: "PulseFit <onboarding@resend.dev>",
    to: ["isaac.s.baku@gmail.com"],
    subject: "New PulseFit Client",
    html: `
      <h2>New PulseFit Client</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Goal:</strong> ${goal}</p>
      <p><strong>Message:</strong> ${message}</p>
    `,
  });

  // Confirmation email to USER
  await resend.emails.send({
    from: "PulseFit <onboarding@resend.dev>",
    to: [email],
    subject: "We received your request 💪",
    html: `
      <p>Hey ${name},</p>
      <p>Thanks for reaching out to <strong>PulseFit</strong>.</p>
      <p>We received your request and will get back to you shortly.</p>
      <p><strong>Your goal:</strong> ${goal}</p>
      <p>Stay strong 💪<br/>PulseFit Team</p>
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
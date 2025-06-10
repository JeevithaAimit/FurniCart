const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Use your real email and app password (from Gmail app password settings)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // ⚠️ Accepts self-signed certificates
  },
});


router.post("/send-invoice-email", upload.single("invoice"), async (req, res) => {
  const { email } = req.body;
  const invoiceBuffer = req.file?.buffer;

  if (!email || !invoiceBuffer) {
    return res.status(400).json({ success: false, message: "Missing email or invoice." });
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "FurniCart Invoice", // <-- Updated subject line
      text: "Attached is your FurniCart invoice.",
      attachments: [
        {
          filename: "invoice.pdf",
          content: invoiceBuffer,
        },
      ],
    });
    

    console.log("Email sent:", info.response);
    res.json({ success: true, message: "Invoice emailed successfully!" });
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({ success: false, message: "Failed to send email." });
  }
});

module.exports = router;


const express = require("express");
const router = express.Router();
// const Review = require("../models/review");
const mongoose = require("mongoose");
const Feedback = require("../models/feedback"); // ✅ Import feedback model

// ✅ Feedback Submission Endpoint
router.post("/feedback", async (req, res) => {
  try {
    const { orderId, rating, feedback, complaint } = req.body;

    if (!orderId || !rating || !feedback) {
      return res.status(400).json({ message: "All fields except complaint are required" });
    }

    const newFeedback = new Feedback({
      orderId,
      rating,
      feedback,
      complaint
    });

    await newFeedback.save();

    res.status(201).json({ message: "Feedback submitted successfully" });
  } catch (error) {
    console.error("Feedback submission error:", error);
    res.status(500).json({ message: "Server error while submitting feedback" });
  }
});
module.exports = router;
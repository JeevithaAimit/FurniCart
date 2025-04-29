const express = require("express");
const router = express.Router();
const Review = require("../models/Review");

// Get all reviews (Manager Panel use)
router.get("/all", async (req, res) => {
  try {
    const reviews = await Review.find();
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch reviews", error });
  }
});

// ✅ Get reviews for a specific product
router.get("/product/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ productId });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch reviews for product", error });
  }
});

module.exports = router;

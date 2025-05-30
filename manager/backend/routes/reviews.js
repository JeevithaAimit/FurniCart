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

router.put('/:reviewId/reply', async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reply } = req.body;

    console.log("Received reply:", reply, "for review:", reviewId);

    if (!reply) return res.status(400).json({ error: 'Reply is required' });

    const updatedReview = await Review.findByIdAndUpdate(
      reviewId,
      { $push: { replies: { text: reply } } }, // ✅ Push into the replies array
      { new: true }
    );

    if (!updatedReview)
      return res.status(404).json({ error: 'Review not found' });

    res.json(updatedReview);
  } catch (err) {
    console.error("Error updating reply:", err);
    res.status(500).json({ error: 'Server error' });
  }
});
router.get("/product/:productId", async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId })
                                .select('customerName rating review replies createdAt'); 
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Error fetching reviews" });
  }
});


module.exports = router;

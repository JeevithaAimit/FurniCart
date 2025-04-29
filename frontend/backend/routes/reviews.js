const express = require("express");
const router = express.Router();
const Review = require("../models/review");
const mongoose = require("mongoose");

const Order = require("../models/Order"); // Import the Order model

// POST /add - Submit a new review
// POST /add - Submit a new review (only if the customer purchased the product)
// POST /add - Submit a new review (only if the customer purchased the product)
router.post("/add", async (req, res) => {
  try {
    console.log("Review Body:", req.body);

    const {
      productId,
      productName,
      category,
      customerId,
      customerName,
      review,
      rating,
    } = req.body;

    // NOTE: ONLY do this if customerId is stored as ObjectId in Order
    const objectCustomerId = new mongoose.Types.ObjectId(customerId);

    console.log(`Checking purchase for customer: ${customerId}, product: ${productName}`);

    const order = await Order.findOne({
      customerId: objectCustomerId, // or just use customerId if it's a string in your DB
      items: { $elemMatch: { productName } },
    });

    console.log("Order found:", order);

    // ✅ STOP if no matching purchase
    if (!order) {
      console.log("❌ No matching purchase found. Review will not be saved.");
      return res.status(403).json({
        message: "Review denied. You must purchase the product to leave a review.",
      });
    }

    // ✅ STOP if duplicate review exists
    const existingReview = await Review.findOne({
      productId,
      customerId: objectCustomerId,
    });


    // ✅ Save the review ONLY if purchase was found
    const newReview = new Review({
      productId,
      productName,
      category,
      customerId: objectCustomerId,
      customerName,
      review,
      rating,
      status: "Ordered",
      createdAt: new Date(),
    });

    await newReview.save();
    console.log("✅ Review saved.");
    res.status(201).json({ review: newReview });

  } catch (error) {
    console.error("❌ Error adding review:", error);
    res.status(500).json({ message: "Failed to submit review" });
  }
});




  
// POST /check-purchase - Check if the customer has purchased the product (using productName)
router.post("/check-purchase", async (req, res) => {
  try {
    const { customerId, productName } = req.body;
    console.log(`Checking purchase for customer: ${customerId}, product: ${productName}`);
    
    const objectCustomerId = new mongoose.Types.ObjectId(customerId);
  
    const order = await Order.findOne({
      customerId: objectCustomerId,
      items: { $elemMatch: { productName } }  // matching by productName
    });
  
    console.log("Order found:", order);
  
    if (order) {
      res.json({ purchased: true });
    } else {
      res.json({ purchased: false });
    }
  } catch (error) {
    console.error("❌ Error checking purchase status:", error);
    res.status(500).json({ message: "Server error" });
  }
});
  
// GET reviews by product ID (if still needed)
router.get("/product/:productId", async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: "Error fetching reviews" });
  }
});
  
// GET reviews by category
router.get("/category/:catName", async (req, res) => {
  try {
    const reviews = await Review.find({ category: req.params.catName });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: "Error fetching category reviews" });
  }
});
  
// GET all reviews
router.get("/all", async (req, res) => {
  try {
    const reviews = await Review.find();
    res.status(200).json(reviews);
  } catch (error) {
    console.error("❌ Error fetching all reviews:", error);
    res.status(500).json({ message: "Error fetching reviews", error });
  }
});
  
module.exports = router;



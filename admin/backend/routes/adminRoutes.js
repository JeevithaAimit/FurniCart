const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Product = require("../models/Product"); // ✅ Make sure this path is correct

// PUT /admin-api/update-stock/:productId
// Update product stock (by product ID)
// In routes/admin.js or similar
// PUT /admin-api/update-stock/:productId
// Express route to update stock in your Product model



router.put("/update-stock", async (req, res) => {
  try {
    const { productName, quantity } = req.body;

    if (!productName || !quantity) {
      return res.status(400).json({ message: "productName and quantity are required" });
    }

    // 🔍 Find product by name
    const product = await Product.findOne({ name: productName });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.quantity < quantity) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    // ➖ Decrease stock
    product.quantity -= quantity;
    await product.save();

    res.json({
      message: `Stock updated for '${productName}'`,
      updatedStock: product.quantity,
    });
  } catch (error) {
    console.error("❌ Stock update error:", error);
    res.status(500).json({ message: "Server error", error });
  }
});



module.exports = router;




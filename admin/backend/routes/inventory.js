const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

router.get("/category-summary", async (req, res) => {
  try {
    const categories = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          totalProducts: { $sum: 1 },
          availableCount: {
            $sum: {
              $cond: [{ $eq: ["$isAvailable", true] }, 1, 0],
            },
          },
          unavailableCount: {
            $sum: {
              $cond: [{ $eq: ["$isAvailable", false] }, 1, 0],
            },
          },
          totalSalesPrice: { $sum: "$price" },
        },
      },
      {
        $project: {
          category: "$_id",
          _id: 0,
          totalProducts: 1,
          availableCount: 1,
          unavailableCount: 1,
          totalSalesPrice: 1,
        },
      },
      {
        $sort: { category: 1 }, // Optional: sort alphabetically
      },
      {
        $limit: 9 // Limit to 9 categories as requested
      }
    ]);

    // Fetch all products for later detailed display in frontend
    const allProducts = await Product.find();

    res.json({ categories, allProducts });
  } catch (error) {
    console.error("Error fetching category summary:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;

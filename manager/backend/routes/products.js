const express = require("express");
const router = express.Router();
const Product = require("../models/Products"); // ✅ Use the correct model name: Product

// ✅ Fetch all products
router.get("/all", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

router.post("/upload-image", async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(file.buffer);

    // 🔍 Log the result to verify secure_url and public_id
    console.log("✅ Full Cloudinary result:", result);

    res.json({ imageUrl: result.secure_url });
  } catch (error) {
    console.error("❌ Upload error:", error);
    res.status(500).json({ message: "Upload failed", error });
  }
});


module.exports = router;

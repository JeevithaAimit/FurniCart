const express = require("express");
const router = express.Router();
const Customer = require("../models/customer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const upload = multer({ dest: "uploads/" }); // Temporary file storage for multer

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


// ✅ Registration Endpoint
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    const existingUser = await Customer.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newCustomer = new Customer({ name, email, phone, password: hashedPassword });

    await newCustomer.save();
    res.status(201).json({ message: "Registration successful!" });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error });
  }
});



// ✅ Login Endpoint (Fixed)
router.post("/login", async (req, res) => {
  const { email, password } = req.body; // ✅ Check if request body exists

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const customer = await Customer.findOne({ email });

    if (!customer) {
      return res.status(400).json({ message: "Customer not found" });
    }

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: customer._id }, "your_secret_key", { expiresIn: "1h" });

    res.json({ 
      message: "Login successful", 
      token, 
      customer:{
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      }
     });
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/api/customer/update/:id", upload.single("profileImage"), async (req, res) => {
  const customerId = req.params.id;
  const { name, email, phone } = req.body;

  // Check if a file (profileImage) is provided and upload to Cloudinary
  let profileImageUrl = null;
  if (req.file) {
    try {
      const result = await cloudinary.uploader.upload(req.file.path, { folder: "customer_profiles" });
      profileImageUrl = result.secure_url; // Get the URL of the uploaded image
    } catch (error) {
      console.error("Error uploading image to Cloudinary:", error);
      return res.status(500).json({ message: "Error uploading profile image", error });
    }
  }

  try {
    const updatedCustomer = await Customer.findByIdAndUpdate(
      customerId,
      { name, email, phone, profileImage: profileImageUrl || undefined },
      { new: true }  // This returns the updated document
    );

    if (!updatedCustomer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    return res.status(200).json(updatedCustomer);
  } catch (err) {
    console.error('Error updating customer:', err);
    return res.status(500).json({ message: 'Error updating profile', error: err });
  }
});


module.exports = router;
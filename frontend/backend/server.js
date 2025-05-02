require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Customer = require("./models/customer");

// ✅ Import routes
const authRoutes = require("./routes/authRoutes"); 
const cartRoutes = require("./routes/cartRoutes"); 
const orderRoutes = require("./routes/orderRoutes"); 
const paymentRoutes = require("./routes/paymentRoutes"); 
const sendInvoiceEmailRoute = require('./routes/sendInvoiceEmailRoute');
const reviewRoutes = require("./routes/reviews");
const contactRoutes = require("./routes/contactRoutes");

const app = express();
app.use(express.json());
app.use(cors());

// ✅ Use router with correct API prefix
app.use("/api/auth", authRoutes); // ✅ Use authRoutes for authentication
app.use("/api/cart", cartRoutes);
app.use("/api", orderRoutes);
app.use("/api", paymentRoutes);
app.use('/api', sendInvoiceEmailRoute);
app.use("/api/reviews", reviewRoutes);
app.use("/api/contact", contactRoutes);


app.use(express.urlencoded({ extended: true })); // ✅ Parse form data

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI);

mongoose.connection.on("connected", () => console.log("✅ Connected to MongoDB"));
mongoose.connection.on("error", (err) => console.error("❌ MongoDB connection error:", err));

// ✅ Start the server
const PORT = process.env.PORT || 8500;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

require("dotenv").config(); // Load environment variables
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const reviewRoutes = require("./routes/reviews");
const productRoutes = require("./routes/products");
const managerRoutes = require('./routes/managerRoutes');
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const feedbackRoutes = require("./routes/feedback"); // Or separate file if needed
const streamifier = require("streamifier");


const app = express();
app.use(cors({ origin: "*" })); // Allow all origins (Customize if needed)
app.use(express.json());

app.use('/api/managers', managerRoutes); // Prefix for manager-related routes

// 🔹 Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Multer Setup
const storage = multer.memoryStorage();
const upload = multer({ storage }).any(); // Accepts any file


// Cloudinary Upload Helper
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    let stream = cloudinary.uploader.upload_stream((error, result) => {
      if (error) reject(error);
      else resolve(result.secure_url);
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// 📌 Order Schema
const orderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    billingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      zipCode: { type: String, required: true },
    },
    items: [
      {
        productId: { type: String, required: true },
        productName: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        mainImage: { type: String, required: true },
      },
    ],
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Placed", "Shipped", "Delivered"],
      default: "Placed", // Default status is "Placed"
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

// 📌 Payment Schema
const paymentSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    paymentMethod: { type: String, required: true },
    amount: { type: Number, required: true },
    cardDetails: {
      cardHolder: { type: String },
      cardNumber: { type: String },
      expiryDate: { type: String },
    },
    upiDetails: {
      provider: { type: String },
      upiId: { type: String },
    },
    status: { type: String, required: true, enum: ["Pending", "Completed", "Failed"], default: "Pending" },
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);

// 🔹 Get All Orders
app.get("/api/orders", async (req, res) => {
  console.log("🔹 API hit: /api/orders");
  try {
    const orders = await Order.find().lean();
    res.json(orders);
  } catch (error) {
    console.error("❌ Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// 🔹 Get All Payments
app.get("/api/payments", async (req, res) => {
  console.log("🔹 API hit: /api/payments");
  try {
    const payments = await Payment.find({ orderId: { $ne: null } })
      .populate("orderId", "name email totalPrice")
      .select("orderId paymentMethod amount cardDetails upiDetails status createdAt");

    if (!payments.length) {
      return res.status(404).json({ message: "No payments found" });
    }

    res.json(payments);
  } catch (error) {
    console.error("❌ Error fetching payments:", error);
    res.status(500).json({ error: "Failed to fetch payments" });
  }
});

// 🔹 Delete Order & Associated Payment by ID
app.delete("/api/orders/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid order ID format" });
    }

    // 🔹 Delete associated payments
    await Payment.deleteMany({ orderId: id });

    // 🔹 Then delete the order
    const deletedOrder = await Order.findByIdAndDelete(id);
    if (!deletedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order and its payment(s) deleted successfully!" });
  } catch (error) {
    console.error("❌ Delete Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

const acceptOrderRoutes = require("./routes/orderRoutes");
app.use("/api", acceptOrderRoutes);
app.use("/api/orders", acceptOrderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/products", productRoutes);
app.use('/api/feedbacks', feedbackRoutes); // This must match the frontend path


// 🚀 Start Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));



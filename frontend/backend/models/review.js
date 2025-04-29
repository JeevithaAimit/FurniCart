const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  productName: { type: String, required: true },
  category: { type: String, required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
  customerName: { type: String, required: true },
  review: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" }, // ✅ New field
  status: { type: String, enum: ["Ordered", "Not Ordered"], default: "Not Ordered" }, // ✅ New field
}, { timestamps: true });

module.exports = mongoose.model("Review", reviewSchema);

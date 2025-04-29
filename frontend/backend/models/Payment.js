const mongoose = require("mongoose");

// Helper function to generate a unique Payment ID
const generatePaymentId = () => {
  return `PAY-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
};

const PaymentSchema = new mongoose.Schema({
  paymentId: {
    type: String,
    unique: true,
    default: generatePaymentId, // ✅ Automatically generate unique ID
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  name: { type: String, required: true },
  email: { type: String, required: true },
  paymentMethod: { type: String, required: true },
  amount: { type: Number, required: true },
  cardDetails: {
    cardHolder: String,
    cardNumber: String,
    expiryDate: String,
    cvv: String,
  },
  upiDetails: {
    provider: String,
    upiId: String,
  },
  status: { type: String, default: "Completed" },
}, { timestamps: true });

module.exports = mongoose.model("Payment", PaymentSchema);

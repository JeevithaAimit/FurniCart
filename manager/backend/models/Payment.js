const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, match: /.+\@.+\..+/ },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true }, // ✅ Use ObjectId reference
    paymentMethod: { 
      type: String, 
      enum: ["Credit Card", "UPI", "Net Banking", "Cash"], 
      required: true 
    },
    amount: { type: Number, required: true, min: 0 },

    cardDetails: {
      cardHolder: { type: String, trim: true },
      cardNumber: { 
        type: String,
        match: /^[0-9]{12,19}$/, // Card numbers should be 12-19 digits
        set: (num) => (num ? `**** **** **** ${num.slice(-4)}` : null) // Masking
      },
      expiryDate: { 
        type: String, 
        match: /^(0[1-9]|1[0-2])\/\d{2}$/, // MM/YY format validation
      },
      cvv: { 
        type: String, 
        match: /^[0-9]{3,4}$/, // CVV should be 3-4 digits
        select: false // Hide CVV from queries for security
      }
    },

    upiDetails: {
      provider: { type: String, trim: true },
      upiId: { type: String, trim: true }
    },

    status: { type: String, enum: ["Pending", "Completed", "Failed"], default: "Pending" }
  },
  { timestamps: true }
);

const PaymentModel = mongoose.model("Payment", paymentSchema);
module.exports = PaymentModel;

const express = require("express");
const router = express.Router();
const Payment = require("../models/Payment");
const Order = require("../models/Order"); // ✅ Import Order model

router.post("/payments", async (req, res) => {
  try {
    const { name, email, orderId, paymentMethod, amount, cardDetails, upiDetails } = req.body;

    // Check for missing required fields
    if (!name || !email || !orderId || !paymentMethod || !amount) {
      return res.status(400).json({ message: "⚠️ Missing required payment details" });
    }

    // ✅ Validate if Order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "⚠️ Order not found" });
    }

    // ✅ Create a new payment linked to the order
    const newPayment = new Payment({
      name,
      email,
      orderId: order._id,
      paymentId: `PAY-${Date.now()}`, // 🔥 Add a unique ID manually
      paymentMethod,
      amount,
      cardDetails: paymentMethod === "Credit Card" ? cardDetails : null,
      upiDetails: paymentMethod === "UPI" ? upiDetails : null,
      status: "Completed",
    });
    

    await newPayment.save();
    res.status(201).json({ message: "✅ Payment recorded successfully!", payment: newPayment });

  } catch (error) {
    console.error("❌ Error saving payment:", error.message);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

module.exports = router;

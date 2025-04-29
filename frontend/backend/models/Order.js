const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
      customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true
      },
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
    shippingAddress: {
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
        category: { type: String, required: true } // Each item must include a category
      },
    ],
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Placed", "Packed", "Shipped", "Delivered", "Rejected"], // Added "Packed"
      default: "Placed",
    },
  },
  { timestamps: true }
);

// Post-save middleware to log the category(ies) stored
orderSchema.post("save", function (doc) {
  if (doc.items && doc.items.length > 0) {
    const categories = doc.items.map((item) => item.category);
    console.log("✅ Order saved. Categories stored for each item:", categories);
  } else {
    console.log("✅ Order saved. No items found.");
  }
});

module.exports = mongoose.model("Order", orderSchema);
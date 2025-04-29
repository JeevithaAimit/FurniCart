const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        name: { type: String, required: true },
        image: { type: String, required: true },
        discountPrice: { type: Number, required: true },
        quantity: { type: Number, default: 1 },
        category: String, // ✅ THIS LINE IS IMPORTANT
      },
    ],
  },
  { timestamps: true } // ✅ Track creation & updates
);

module.exports = mongoose.model("Cart", cartSchema);

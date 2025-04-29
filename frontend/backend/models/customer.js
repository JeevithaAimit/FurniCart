const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  profileImage: { type: String }, // URL of uploaded profile image

  // ✅ Status field (Active/Inactive)
  status: { type: String, enum: ["active", "inactive"], default: "inactive" },

  // ✅ Cart Field (Stores Products in the Customer's Cart)
  cart: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" }, // Reference to Product
      name: { type: String, required: true },
      quantity: { type: Number, default: 1 },
      price: { type: Number, required: true },
      discountPrice: { type: Number }, // Optional Discounted Price
      mainImage: { type: String } // Product Image URL
    }
  ]
});

module.exports = mongoose.model("Customer", customerSchema);

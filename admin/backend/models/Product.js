const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: String,
  category: String,
  price: Number,
  discountPrice: Number,
  material: String,
  color: String,
  type: String,
  description: String,
  isAvailable: Boolean,
  mainImage: String,
  subImages: [String],
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);

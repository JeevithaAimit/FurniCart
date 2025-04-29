const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    discountPrice: {
      type: Number,
    },
    material: {
      type: String,
    },
    color: {
      type: String,
    },
    type: {
      type: String,
    },
    quantity: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    mainImage: {
      type: String,
      default: 'https://placehold.co/100'
    },
    subImages: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;

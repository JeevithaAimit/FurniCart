const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
//   ordersCount: { type: Number, default: 0 },
});

module.exports = mongoose.model("Customer", CustomerSchema);

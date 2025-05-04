const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Order"
  },
  rating: {
    type: Number,
    required: true
  },
  feedback: {
    type: String,
    required: true
  },
  complaint: {
    type: String
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Feedback", feedbackSchema);

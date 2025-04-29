const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema({
    orderId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
    name: String,
    email: String,
    phone: String,
    billingAddress: {
        address: String,
        city: String,
        state: String,
        country: String,
        zipCode: String,
    },
    items: [
        {
            productId: String,
            productName: String,
            price: Number,
            quantity: Number,
            mainImage: String,
        },
    ],
    totalPrice: Number,
    deliveredAt: { type: Date, default: Date.now },
    status: { type: String, default: "Delivered" },
    rating: { type: Number, min: 1, max: 5 }, 
    feedback: { type: String },
    complaint: { type: String }, // ✅ Complaint Dropdown

});

const Delivery = mongoose.model("Delivery", deliverySchema);
module.exports = Delivery;

const mongoose = require("mongoose");

const acceptedOrderSchema = new mongoose.Schema({
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
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
    createdAt: Date,
    updatedAt: Date,
    status: { type: String, enum: ["Shipped", "Delivered"], default: "Shipped" },
});

const AcceptedOrder = mongoose.model("AcceptedOrder", acceptedOrderSchema);
module.exports = AcceptedOrder;

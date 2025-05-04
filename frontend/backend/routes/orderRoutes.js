const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const OrderModel = require("../models/Order");
const Customer = require("../models/customer");
const Cart = require("../models/cartModel");  // ✅ Import Cart model
const Delivery = require("../models/deliveryModel"); // ✅ This is what you missed



// Order Placement Route
const axios = require("axios"); 
router.post("/orders", async (req, res) => {
  const {
    name,
    email,
    phone,
    billingAddress,
    shippingAddress,
    items,
    totalPrice,
  } = req.body;

  if (
    !name ||
    !email ||
    !phone ||
    !billingAddress?.address ||
    !shippingAddress?.address
  ) {
    return res
      .status(400)
      .json({ message: "Billing and shipping addresses are required" });
  }

  const failedUpdates = [];

  try {
    const order = new OrderModel({
      customerId: req.body.customerId,  // ✅ Add this line
      name,
      email,
      phone,
      billingAddress,
      shippingAddress,
      items,
      totalPrice,
    });
    

    await order.save();
    for (const item of items) {
      const productName = item.productName?.trim();
      const quantity = Number(item.quantity);
    
      if (!productName || isNaN(quantity)) {
        console.error("❌ Invalid productName or quantity:", item);
        failedUpdates.push({
          productName: productName || "Unknown",
          error: "Missing or invalid productName or quantity",
        });
        continue;
      }
    
      console.log("📦 Updating stock for:", { productName, quantity });
    
      try {
        await axios.put("http://localhost:5000/admin-api/update-stock", {
          productName,
          quantity,
        });
    
        console.log(`✅ Stock updated for "${productName}"`);
      } catch (err) {
        console.error(
          `❌ Failed to update stock for product "${productName}":`,
          err.response?.data || err.message
        );
    
        failedUpdates.push({
          productName,
          error: err.response?.data?.message || err.message,
        });
      }
    }
    
    

    res.status(201).json({
      message:
        failedUpdates.length === 0
          ? "Order placed successfully"
          : "Order placed, but some stock updates failed",
      order,
      stockUpdateErrors: failedUpdates,
    });
  } catch (error) {
    console.error("❌ Order Save Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
});




// Order Tracking Route
router.get("/track/:orderId", async (req, res) => {
  try {
      let { orderId } = req.params;
      orderId = orderId.trim();

      console.log("🔍 Searching for Order ID in Order collection:", orderId);

      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(orderId)) {
          console.log("❌ Invalid Order ID format");
          return res.status(400).json({ message: "Invalid Order ID" });
      }

      // Fetch order from Order collection
      const order = await OrderModel.findById(orderId); // ✅ Use OrderModel

      if (!order) {
          console.log("❌ Order not found in DB");
          return res.status(404).json({ message: "Order not found" });
      }

      console.log("✅ Order found:", order);
      res.json({
          orderId: order._id,
          status: order.status,
          items: order.items, // ✅ Include items
      });
  } catch (error) {
      console.error("❌ Error fetching order:", error);
      res.status(500).json({ message: "Server error", error });
  }
});

router.put("/status/:userId", async (req, res) => {
  try {
    const { status } = req.body;
    await User.findByIdAndUpdate(req.params.userId, { status });
    res.json({ message: `User status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ message: "Failed to update status" });
  }
});

router.put("/logout", async (req, res) => {
  const { email } = req.body; // Get email from request

  try {
    if (!email) {
      return res.status(400).json({ message: "Email is required for logout" });
    }

    // ✅ Find the user and update status to "inactive"
    const user = await Customer.findOneAndUpdate({ email }, { status: "inactive" });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User logged out successfully" });
  } catch (error) {
    console.error("❌ Logout Error:", error);
    res.status(500).json({ message: "Logout failed", error });
  }
});





// router.post("/accept-order/:orderId", async (req, res) => {
//     try {
//       const { orderId } = req.params;
//       console.log("🔄 Received request to update order:", orderId);

//       if (!mongoose.Types.ObjectId.isValid(orderId)) {
//         return res.status(400).json({ error: "Invalid order ID" });
//       }

//       const updatedOrder = await Order.findByIdAndUpdate(
//         orderId,
//         { status: "Shipped" },
//         { new: true }
//       );

//       if (!updatedOrder) {
//         console.log("❌ Order not found:", orderId);
//         return res.status(404).json({ error: "Order not found" });
//       }

//       console.log("✅ Order updated successfully:", updatedOrder);
//       res.json({ message: "Order marked as Shipped", order: updatedOrder });

//     } catch (error) {
//       console.error("❌ Error updating order status:", error);
//       res.status(500).json({ error: error.message || "Internal Server Error" });
//     }
//   });
// router.post("/feedback", async (req, res) => {
//   try {
//       const { orderId, rating, feedback, complaint } = req.body;

//       console.log("🔍 Received Order ID:", orderId);

//       if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
//           return res.status(400).json({ message: "Invalid Order ID format" });
//       }

//       // 🔹 Find the delivered order
//       const delivery = await Delivery.findOne({ orderId });

//       if (!delivery) {
//           return res.status(404).json({ message: "Order not found" });
//       }

//       // 🔹 Update feedback & complaint
//       delivery.rating = rating;
//       delivery.feedback = feedback;
//       delivery.complaint = complaint;
//       await delivery.save();

//       res.json({ message: "Feedback submitted successfully!" });

//   } catch (error) {
//       console.error("❌ Error submitting feedback:", error);
//       res.status(500).json({ message: "Server error" });
//   }
// });

router.get("/get", async (req, res) => {
  try {
    const customer = await Customer.findById(req.user.id);  // ✅ Use Customer model
    if (!customer) return res.status(404).json({ success: false, message: "Customer not found" });

    res.json({ success: true, cart: customer.cart });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// In your Express backend (e.g., orderRoutes.js)
router.get('/user/:customerId', async (req, res) => {
  const customerId = req.params.customerId;
  try {
    const orders = await Order.find({ customerId }); // match customerId
    res.json(orders); // frontend will count this
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error });
  }
});
// router.get("/order-count/:customerId", async (req, res) => {
//   try {
//     const customerObjectId = new mongoose.Types.ObjectId(req.params.customerId);
//     const count = await Order.countDocuments({ customerId: customerObjectId });
//     res.json({ count });
//   } catch (error) {
//     console.error("❌ Error fetching order count:", error);
//     res.status(500).json({ error: "Failed to fetch order count" });
//   }
// });


module.exports = router;  
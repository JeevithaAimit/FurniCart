const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const AcceptedOrder = require("../models/AcceptedOrder");
const Order = require("../models/Order");
const RejectedOrder = require("../models/RejectedOrder");
// const RejectedOrder = require("../models/RejectedOrder");
const Delivery = require("../models/deliveryModel"); // ✅ Import Delivery model
const { ObjectId } = require("mongoose").Types;


router.get("/orders", async (req, res) => {
    try {
      const orders = await Order.find(); // Fetch all orders from the Order collection
      if (!orders.length) {
        return res.status(404).json({ message: "No orders found" });
      }
      res.status(200).json(orders); // Return the orders as response
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Error fetching orders" });
    }
  });
  
  
  router.get("/orders", async (req, res) => {
    try {
        const packedOrders = await Order.find({ status: "Packed" }); // ✅ Fetch only Packed orders

        if (!packedOrders.length) {
            return res.status(404).json({ message: "No packed orders found" });
        }

        res.status(200).json(packedOrders);
    } catch (error) {
        console.error("❌ Error fetching packed orders:", error);
        res.status(500).json({ message: "Error fetching orders" });
    }
});

//   router.get("/order", async (req, res) => {
//     console.log("Received GET request to /api/order"); // Debug log

//     try {
//         const orders = await Order.find({}, "_id name items status");

//         if (!orders.length) {
//             return res.status(404).json({ message: "No orders found" });
//         }

//         res.status(200).json(orders);
//     } catch (error) {
//         console.error("Error fetching orders:", error);
//         res.status(500).json({ message: "Error fetching orders" });
//     }
// });

  
  
// ✅ Accept order, update status & move to AcceptedOrders collection
router.post("/accept-order/:id", async (req, res) => {
    try {
        console.log("📢 Accept Order API Called for ID:", req.params.id);

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid order ID" });
        }

        const order = await Order.findById(req.params.id);
        if (!order) {
            console.log("❌ Order not found in DB");
            return res.status(404).json({ message: "Order not found" });
        }

        // ✅ Update order status to "Shipped"
        order.status = "Shipped";
        await order.save();

        console.log("✅ Order Status Updated:", order.status);

        // ✅ Move the accepted order to AcceptedOrders collection with orderId
        const acceptedOrder = new AcceptedOrder({
            orderId: order._id, 
            name: order.name, // ✅ Add Name
            email: order.email, // ✅ Add Email
            phone: order.phone, // ✅ Add Phone
            billingAddress: order.billingAddress, // ✅ Add Billing Address
            items: order.items, 
            totalPrice: order.totalPrice,
            status: "Shipped",
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        await acceptedOrder.save();

        console.log("✅ Order moved to AcceptedOrders collection");

        res.status(200).json({
            message: "Order marked as shipped and moved to AcceptedOrders successfully",
            updatedOrder: order, // Returning the updated order
        });
    } catch (error) {
        console.error("❌ Error processing accept order:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get("/accepted-orders", async (req, res) => {
    try {
        const acceptedOrders = await AcceptedOrder.find();
        if (!acceptedOrders.length) {
            return res.status(404).json({ message: "No accepted orders found" });
        }
        res.status(200).json(acceptedOrders);
    } catch (error) {
        console.error("❌ Error fetching accepted orders:", error);
        res.status(500).json({ message: "Error fetching accepted orders" });
    }
});

// ✅ Deliver order and update status to "Delivered"
router.post("/deliver-order/:orderId", async (req, res) => {
    try {
        const { orderId } = req.params;

        // 1️⃣ Fetch the accepted order
        const acceptedOrder = await AcceptedOrder.findOne({ orderId });
        if (!acceptedOrder) return res.status(404).json({ message: "Accepted order not found" });

        // 2️⃣ Update the status in the main Order collection
        await Order.findByIdAndUpdate(
            orderId, 
            { $set: { status: "Delivered" } },
            { new: true }
        );

        // 3️⃣ Move order to Delivered Orders collection
        const deliveredOrder = new Delivery({
            orderId: acceptedOrder.orderId,
            name: acceptedOrder.name,
            email: acceptedOrder.email,
            phone: acceptedOrder.phone,
            billingAddress: acceptedOrder.billingAddress,
            totalPrice: acceptedOrder.totalPrice,
            items: acceptedOrder.items,
            deliveredAt: new Date(),
        });

        await deliveredOrder.save();

        // 4️⃣ Remove from Accepted Orders collection
        // await AcceptedOrder.deleteOne({ orderId });

        res.status(200).json({ message: "Order status updated to Delivered", deliveredOrder });
    } catch (error) {
        console.error("❌ Error updating order status:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});





// ✅ Get Delivered Orders API
router.get("/delivered-orders", async (req, res) => {
    try {
        const deliveredOrders = await Delivery.find();
        res.status(200).json(deliveredOrders);
    } catch (error) {
        console.error("❌ Error fetching delivered orders:", error);
        res.status(500).json({ message: "Error fetching delivered orders" });
    }
});


// rejected orders
router.post("/reject-order/:id", async (req, res) => {
    try {
        console.log("📢 Reject Order API Called for ID:", req.params.id);

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid order ID" });
        }

        const order = await Order.findById(req.params.id);
        if (!order) {
            console.log("❌ Order not found in DB");
            return res.status(404).json({ message: "Order not found" });
        }

        // ✅ Move order to RejectedOrders collection
        const rejectedOrder = new RejectedOrder({
            orderId: order._id,
            name: order.name,
            email: order.email,
            phone: order.phone,
            billingAddress: order.billingAddress,
            items: order.items,
            totalPrice: order.totalPrice,
            createdAt: order.createdAt,
            updatedAt: new Date(),
            status: "Rejected",
        });

        await rejectedOrder.save();

        // ❌ Remove from original Orders collection (optional)
        await Order.findByIdAndDelete(req.params.id);

        console.log("✅ Order Rejected & Moved to RejectedOrders");

        res.status(200).json({
            message: "Order rejected successfully",
            rejectedOrder,
        });
    } catch (error) {
        console.error("❌ Error rejecting order:", error);
        res.status(500).json({ message: "Error rejecting order" });
    }
});

router.get("/order-summary", async (req, res) => {
    try {
        const { date } = req.query;

        // ✅ Fetch Overall Summary (for Table & Graph)
        const categorySummary = await Order.aggregate([
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.category",
                    totalOrders: { $sum: 1 },
                    totalSales: { $sum: "$totalPrice" },
                },
            },
            { $sort: { totalSales: -1 } }
        ]);

        const totalOrders = await Order.countDocuments();
        const totalSalesResult = await Order.aggregate([
            { $group: { _id: null, total: { $sum: "$totalPrice" } } }
        ]);
        const totalSales = totalSalesResult.length > 0 ? totalSalesResult[0].total : 0;

        // ✅ Fetch Date-Specific Summary (if a date is selected)
        let filteredSummary = { totalOrders: 0, totalSales: 0 };
        if (date) {
            // Convert string date to a Date object (fix potential timezone issues)
            const selectedDate = new Date(date);
            selectedDate.setUTCHours(0, 0, 0, 0);  // Normalize start of the day
            const endOfDay = new Date(selectedDate);
            endOfDay.setUTCHours(23, 59, 59, 999); // End of the day

            const matchQuery = {
                orderDate: { $gte: selectedDate, $lt: endOfDay }
            };

            filteredSummary.totalOrders = await Order.countDocuments(matchQuery);
            const filteredSalesResult = await Order.aggregate([
                { $match: matchQuery },
                { $group: { _id: null, total: { $sum: "$totalPrice" } } }
            ]);
            filteredSummary.totalSales = filteredSalesResult.length > 0 ? filteredSalesResult[0].total : 0;
        }

        res.json({ totalOrders, totalSales, categorySummary, filteredSummary });
    } catch (error) {
        console.error("❌ Error fetching order summary:", error);
        res.status(500).json({ message: "Server error", error });
    }
});


// router.get("/feedbacks", async (req, res) => {
//     try {
//         const feedbacks = await Delivery.find(
//             { feedback: { $exists: true, $ne: "" } }, // Only retrieve records with feedback
//             { orderId: 1, email: 1, feedback: 1, complaint: 1, rating: 1, _id: 0 } // Select fields
//         );

//         console.log("🔍 Feedbacks from DB:", feedbacks);

//         if (feedbacks.length === 0) {
//             return res.status(404).json({ message: "No feedback available" });
//         }

//         res.json(feedbacks);
//     } catch (error) {
//         console.error("❌ Error fetching feedbacks:", error);
//         res.status(500).json({ message: "Server error" });
//     }
// });

router.get("/orders-by-category/:category", async (req, res) => {
    try {
        const { category } = req.params;

        // Find orders where any item in 'items' array belongs to the selected category
        const orders = await Order.find({ "items.category": category }).select("name email phone items totalPrice status createdAt");

        // Restructure response
        const formattedOrders = orders.map(order => ({
            orderId: order._id,
            name: order.name,
            email: order.email,
            phone: order.phone,
            category,
            totalPrice: order.totalPrice,
            quantity: order.items.reduce((sum, item) => sum + item.quantity, 0),
            status: order.status
        }));

        res.json(formattedOrders);
    } catch (error) {
        console.error("❌ Error fetching orders by category:", error);
        res.status(500).json({ message: "Server error", error });
    }
});

router.get("/delivered-orders", async (req, res) => {
    try {
        const deliveredOrdersCount = await Order.countDocuments({ status: "Delivered" });
      console.log("Delivered Orders Count:", deliveredOrdersCount); // Log the count
      res.json({ deliveredOrders: deliveredOrdersCount });
    } catch (error) {
      console.error("❌ Error fetching delivered orders count:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
  
router.get("/total-orders", async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments(); // Count total orders
        res.json({ totalOrders });
    } catch (error) {
        console.error("Error fetching total orders:", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/rejected-orders/count", async (req, res) => {
    try {
      const rejectedCount = await Order.countDocuments({ status: "Rejected" });
      res.json({ rejectedCount });
    } catch (error) {
      console.error("Error fetching rejected orders count:", error);
      res.status(500).json({ message: "Server Error" });
    }
  });

router.get("/pending-orders/count", async (req, res) => {
    try {
        const pendingCount = await Order.countDocuments({ status: { $nin: ["Delivered", "Rejected"] } });
        res.json({ pendingOrders: pendingCount });
    } catch (error) {
        console.error("❌ Error fetching pending orders count:", error);
        res.status(500).json({ message: "Error fetching pending orders count" });
    }
});

// Allowed statuses
// Allowed statuses
const VALID_STATUSES = ["Pending", "Packed", "Shipped", "Delivered", "Rejected"];

router.put("/orders/:id/status", async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;

        console.log(`🔄 Updating order ${id} to status: ${status}`);

        if (!status) {
            return res.status(400).json({ message: "Status is required" });
        }

        // Check if the status is valid
        if (!VALID_STATUSES.includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            { $set: { status } },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.json(updatedOrder);
    } catch (error) {
        console.error("❌ Server Error:", error);
        res.status(500).json({ message: "Server error", error });
    }
});


router.get("/orders/packed", async (req, res) => {
    try {
        const packedOrders = await Order.find({ status: "Packed" });

        if (!packedOrders.length) {
            return res.status(404).json({ message: "No packed orders found" });
        }

        console.log("✅ Packed Orders Fetched:", packedOrders); // Debugging log

        res.status(200).json(packedOrders);
    } catch (error) {
        console.error("❌ Error fetching packed orders:", error);
        res.status(500).json({ message: "Error fetching packed orders" });
    }
});


router.get("/orders/shipped", async (req, res) => {
    try {
      const shippedOrders = await Order.find({ status: "Shipped" });
      res.status(200).json(shippedOrders);
    } catch (error) {
      console.error("Error fetching shipped orders:", error);
      res.status(500).json({ message: "Failed to fetch shipped orders" });
    }
  });
  

  router.get("/orders/delivered", async (req, res) => {
    try {
      const deliveredOrders = await Order.find({ status: "Delivered" });
      res.json(deliveredOrders);
    } catch (error) {
      console.error("❌ Error fetching delivered orders:", error);
      res.status(500).json({ error: "Failed to fetch delivered orders" });
    }
  });
  
  

module.exports = router;

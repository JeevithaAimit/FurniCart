const express = require("express");
const router = express.Router();
const Customer = require("../models/customer");
const Cart = require("../models/cartModel");

// ✅ Add to Cart
router.post("/add", async (req, res) => {
  try {
    const { userId, product, quantity } = req.body;

    if (!userId || !product._id || !quantity) {
      return res.status(400).json({ message: "Missing userId or product in request body" });
    }

    const user = await Customer.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userCart = await Cart.findOne({ userId });
    const existingItem = userCart?.items.find(item => item.productId.toString() === product._id.toString());

    let newItem = null;
    if (existingItem) {
      return res.status(404).json({ message: "Product already exists in Cart!" });
    } else {
      const addProduct = {
        productId: product._id,
        name: product.name,
        image: product.mainImage,
        discountPrice: product.discountPrice,
        category: product.category, 
      }

      newItem = await Cart.findOneAndUpdate(
        { userId },
        { $push: { items: addProduct } },
        { new: true, upsert: true }
      );
    }

    res.status(200).json({ message: "Item added to cart", cart: newItem });
  } catch (error) {
    console.error("❌ Error in /cart/add:", error);
    res.status(500).json({ message: "Error adding to cart", error });
  }
});



// ✅ Remove from Cart
router.post("/remove", async (req, res) => {
  const { userId, productId } = req.body;

  try {
    // Validate input
    if (!userId || !productId) {
      return res.status(400).json({ message: "Missing userId or productId in request body" });
    }

    // Use findOneAndUpdate to remove the specific item from the items array
    const updatedCart = await Cart.findOneAndUpdate(
      { userId }, // Find the cart by userId
      { $pull: { items: { _id: productId } } }, // Remove the item with matching _id from items array
      { new: true } // Return the updated document after modification
    );

    if (!updatedCart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    res.json({ success: true, message: "Item removed", cart: updatedCart });
  } catch (error) {
    console.error("Error removing item:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});



// ✅ Update Cart Quantity
router.post("/update", async (req, res) => {
  const { userId, productId, quantity } = req.body;

  try {
    const updatedCart = await Cart.findOneAndUpdate(
      { userId, "items._id": productId }, // Match the cart by userId and the specific item by productId
      { $set: { "items.$.quantity": quantity } }, // Update the quantity of the matched item
      { new: true } // Return the updated document
    );

    if (!updatedCart) {
      return res.status(404).json({ success: false, message: "Cart or item not found" });
    }

    res.json({ success: true, message: "Cart updated", cart: updatedCart });
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// router.post("/sync", async (req, res) => {
//   try {
//     const { userId, cartItems } = req.body; // `cartItems` should be an array

//     if (!userId) {
//       return res.status(400).json({ message: "User ID is required" });
//     }

//     let cart = await Cart.findOne({ userId });

//     if (!cart) {
//       cart = new Cart({ userId, items: cartItems });
//     } else {
//       cart.items = cartItems;
//     }

//     await cart.save();

//     res.json({ success: true, message: "Cart synced successfully", cart });
//   } catch (error) {
//     console.error("❌ Cart Sync Error:", error);
//     res.status(500).json({ message: "Cart sync failed", error });
//   }
// });


router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const cart = await Cart.findOne({ userId })

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    res.json({ success: true, cart: cart.items });
  } catch (error) {
    console.error("❌ Error fetching cart:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
});

router.get("/api/cart/:userId", async (req, res) => {
  try {
    const cart = await Cart.findOne({ customerId: req.params.userId });
    if (!cart) return res.json({ items: [] });
    res.json(cart.items);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});


module.exports = router;
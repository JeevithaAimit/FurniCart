import "./cart.css";
import { useCart } from "../components/CartContext";
import { FaTrash, FaPlus, FaMinus } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const Cart = () => {
  const { cart, setCart, removeFromCart, updateQuantity } = useCart();  // Ensure setCart is available
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  console.log("🛒 Cart Page Loaded:", cart);

  // ✅ Fetch Cart from MongoDB on Mount
  useEffect(() => {
    if (!token) {
      alert("Please log in to access the cart!");
      navigate("/login");
      return;
    }

    axios.get(`http://localhost:8500/api/cart/${user?.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(response => {
        console.log("✅ Cart Data from MongoDB:", response.data.cart);
        if (Array.isArray(response.data.cart)) {
          setCart(response.data.cart);
          localStorage.setItem("cart", JSON.stringify(response.data.cart));
        } else {
          console.error("❌ Invalid cart data received:", response.data);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error("❌ Error fetching cart:", error.response?.data || error);
        setLoading(false);
      });
  }, [setCart, token, navigate, user?.id]);



  // ✅ Update Cart in MongoDB
  // const updateCartInDB = async (cartData) => {
  //   const token = localStorage.getItem("token");
  //   const userId = localStorage.getItem("userId");

  //   if (!userId) {
  //     console.error("❌ No userId found in localStorage");
  //     return;
  //   }

  //   console.log("🟢 Sending Cart Update Request:", { userId, cartData });

  //   try {
  //     const response = await axios.post(
  //       "http://localhost:8500/api/cart/update",
  //       { userId, cart: cartData },
  //       {
  //         headers: {
  //           "Content-Type": "application/json",
  //           "Authorization": `Bearer ${token}`,
  //         },
  //       }
  //     );

  //     console.log("✅ Cart Updated Successfully:", response.data);
  //   } catch (error) {
  //     console.error("❌ Failed to update cart:", error.response?.data || error);
  //   }
  // };

  // ✅ Increase Quantity
  const increaseQuantity = async (productId) => {
    const item = cart.find((item) => item._id === productId);
    await updateQuantity(user.id, productId, item.quantity + 1);
  };

  // ✅ Decrease Quantity (Removes item if quantity reaches 1)
  const decreaseQuantity = async (productId) => {
    const item = cart.find((item) => item._id === productId);
    if (item && item.quantity === 1) {
      toast.error("Item quantity cannot be less than 1!");
      return;
    }
    await updateQuantity(user?.id, productId, item.quantity - 1);
  };

  // ✅ Remove from Cart
  const handleRemove = async (productId) => {
    await removeFromCart(user?.id, productId);

    const updatedCart = cart.filter((item) => item._id !== productId);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  // ✅ Calculate Totals
  const subTotal = cart?.reduce(
    (total, item) => total + (item.discountPrice || item.price) * item.quantity,
    0
  );
  const gstRate = 18;
  const gstAmount = (subTotal * gstRate) / 100;
  const grandTotal = subTotal + gstAmount;

  console.log("cart", cart);

  return (
    <div className="cart-page">
      <div className="cart-container">
        <h2 className="cart-title">
          Your Cart ({cart?.length || 0} {cart?.length === 1 ? "item" : "items"})
        </h2>

        {loading ? (
          <p>Loading cart...</p>
        ) : cart.length === 0 ? (
          <p className="cart-empty">Your cart is empty.</p>
        ) : (
          <>
            <div className="cart-items cart-header">
              <p className="item-header">Item</p>
              <p>Price</p>
              <p>Quantity</p>
              <p>Total</p>
            </div>

            {cart.map((item, index) => (
              <div key={`${item._id}-${index}`} className="cart-item">
                {/* ✅ Product Image */}
                <div className="cart-item-info">
                  <img
                    src={item.image ?? "https://via.placeholder.com/100"}
                    alt={item.name || "Product Image"}
                    className="cart-item-image"
                  />
                  <p className="cart-item-name">{item.name}</p>
                </div>

                {/* ✅ Product Price */}
                <p className="price">₹{item.discountPrice || item.price}</p>

                {/* ✅ Quantity */}
                <div className="quantity-control">
                  <button onClick={() => decreaseQuantity(item._id)} className="qty-btn"><FaMinus /></button>
                  <p className="quantity">{item.quantity || 1}</p>
                  <button onClick={() => increaseQuantity(item._id)} className="qty-btn"><FaPlus /></button>
                </div>

                {/* ✅ Total Price */}
                <p className="total-price">
                  ₹{(item.quantity * (item.discountPrice || item.price)).toFixed(2)}
                </p>

                <button className="delete-btn" onClick={() => handleRemove(item._id)}>
                  <FaTrash />
                </button>
              </div>
            ))}
          </>
        )}
      </div>

      {cart.length > 0 && (
        <div className="cart-summary">
          <div className="summary-details">
            <p>Subtotal:</p>
            <span>₹{subTotal.toFixed(2)}</span>
          </div>
          <div className="summary-details">
            <p>GST ({gstRate}%):</p>
            <span>₹{gstAmount.toFixed(2)}</span>
          </div>
          <div className="summary-details">
            <p>Shipping:</p>
            <span className="shipping">After delivery</span>
          </div>
          <div className="summary-total">
            <h3>Grand Total:</h3>
            <h3>₹{grandTotal.toFixed(2)}</h3>
          </div>
          
          <p className="no-refund-note">Note: No Refund Policy</p>
          <Link to="/Checkout" className="checkout-btn">
            Check out
          </Link>


        </div>
      )}
    </div>
  );
};

export default Cart;

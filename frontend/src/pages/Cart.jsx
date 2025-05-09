import "./cart.css";
import { useCart } from "../components/CartContext";
import { FaTrash, FaPlus, FaMinus } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const Cart = () => {
  const { cart, setCart, removeFromCart, updateQuantity, updateCartItemQuantity } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stockInfo, setStockInfo] = useState([]);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

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
        if (Array.isArray(response.data.cart)) {
          setCart(response.data.cart);
          localStorage.setItem("cart", JSON.stringify(response.data.cart));
        } else {
          console.error("❌ Invalid cart data:", response.data);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error("❌ Error fetching cart:", error.response?.data || error);
        setLoading(false);
      });
  }, [setCart, token, navigate, user?.id]);

  useEffect(() => {
    if (cart.length === 0) return;
    const fetchStockInfo = async () => {
      try {
        const stockRes = await Promise.all(
          cart.map((item) =>
            axios.get(`http://localhost:5000/products/${item.productId || item._id}`)
          )
        );
        setStockInfo(stockRes.map((res) => res.data));
      } catch (error) {
        console.error("❌ Error fetching stock info:", error);
        toast.error("Failed to load stock information.");
      }
    };
    fetchStockInfo();
  }, [JSON.stringify(cart)]);

  const handleIncrease = async (productId) => {
    const item = cart.find((item) => item._id === productId);
    const product = stockInfo.find((prod) => prod._id === item.productId || prod._id === item._id);
  
    if (!item || !product) {
      toast.error("Item or product information not found.");
      return;
    }
  
    if (item.quantity < product.quantity) {
      await updateQuantity(user.id, productId, item.quantity + 1);
    } else {
      toast.warn(`⚠️ Only ${product.quantity} in stock. You've reached the limit.`);
    }
  };
  
  
  

  const decreaseQuantity = async (productId) => {
    const item = cart.find((item) => item._id === productId);
    if (item.quantity === 1) {
      toast.error("Quantity cannot be less than 1.");
      return;
    }
    await updateQuantity(user.id, productId, item.quantity - 1);
  };

  const handleRemove = async (productId) => {
    await removeFromCart(user.id, productId);
    const updatedCart = cart.filter((item) => item._id !== productId);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const subTotal = cart.reduce(
    (total, item) => total + (item.discountPrice || item.price) * item.quantity,
    0
  );
  const gstRate = 18;
  const gstAmount = (subTotal * gstRate) / 100;
  const grandTotal = subTotal + gstAmount;

  return (
    <div className="cart-page">
      <div className="cart-container">
        <h2 className="cart-title">
          Your Cart ({cart.length} {cart.length === 1 ? "item" : "items"})
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

            {cart.map((item, index) => {
  const productStock = stockInfo.find((p) => p._id === item.productId || p._id === item._id);

  return (
    <div key={`${item._id}-${index}`} className="cart-item">
      <div className="cart-item-info">
        <img
          src={item.image || "https://via.placeholder.com/100"}
          alt={item.name}
          className="cart-item-image"
        />
        <p className="cart-item-name">{item.name}</p>
        <div className="stock-info">
          <p>
            Available Stock: {productStock?.quantity ?? "N/A"}{" "}
            {productStock?.quantity < 5 && <span className="low-stock">Low Stock!</span>}
          </p>
        </div>
      </div>

      


                  <p className="price">₹{item.discountPrice || item.price}</p>

                  <div className="quantity-control">
                    <button onClick={() => decreaseQuantity(item._id)} className="qty-btn"><FaMinus /></button>
                    <p className="quantity">{item.quantity}</p>
                    <button onClick={() => handleIncrease(item._id)} className="qty-btn"><FaPlus /></button>
                  </div>

                  <p className="total-price">
                    ₹{(item.quantity * (item.discountPrice || item.price)).toFixed(2)}
                  </p>

                  <button className="delete-btn" onClick={() => handleRemove(item._id)}>
                    <FaTrash />
                  </button>
                </div>
              );
            })}
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

          {/* <div className="stock-info">
            {cart.map((item) => {
              const product = stockInfo.find((prod) => prod._id === item.productId || prod._id === item._id);
              return (
                <p key={item._id}>
                  Available Stock: {product?.quantity ?? "N/A"}{" "}
                  {product?.quantity < 5 && <span className="low-stock">Low Stock!</span>}
                </p>
              );
            })}
          </div> */}

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


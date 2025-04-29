import { createContext, useState, useEffect, useContext, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
const API_BASE_URL = "http://localhost:8500/api/cart"; // ✅ Use correct endpoint


const CartContext = createContext();


export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  // ✅ Update Cart Count
  const updateCartCount = (cartLength) => {
    setCartCount(cartLength);
  };

  // ✅ Fetch User Cart from Database
  // eslint-disable-next-line no-undef
  const fetchUserCart = useCallback(async (userId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCart(response.data.cart);
      updateCartCount(response.data.cart.length);
    } catch (error) {
      console.error("❌ Failed to fetch cart:", error);
    }
  }, [token]);


  // ✅ Load cart from LocalStorage OR fetch from database
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (token && user?.id) {
      fetchUserCart(user?.id);
    } else {
      const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
      console.log("storedCart", storedCart);
      setCart(storedCart);
      updateCartCount(storedCart.length);
      console.warn("⚠️ Using local cart storage as user is not logged in or userId is missing.");
    }
  }, [fetchUserCart, token]);

  // ✅ Add Item to Cart
  const addToCart = async (product) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const updatedCart = Array.isArray(cart) ? [...cart] : [];
    const existingItemIndex = updatedCart.findIndex((item) => item._id === product._id);

    
    if (existingItemIndex !== -1) {
      toast.error("Item already in cart!");
      return;
    }

    updatedCart.push({ ...product, quantity: 1 });
    setCart(updatedCart);
    updateCartCount(updatedCart.length);
    localStorage.setItem("cart", JSON.stringify(updatedCart));

    if (token && user?.id) {
      try {
        await axios.post(
          `${API_BASE_URL}/add`,
          { userId: user.id, product, quantity: 1 },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        console.error("❌ Error adding to cart:", error.response?.data || error.message);
      }
    }

    toast.success(`${product.name} added to cart!`);
  };

  // ✅ Remove Item from Cart
  const removeFromCart = async (userId, productId) => {
    let updatedCart = cart.filter((item) => item._id !== productId);
    setCart(updatedCart);
    updateCartCount(updatedCart.length);
    localStorage.setItem("cart", JSON.stringify(updatedCart));

    if (token) {
      try {
        await axios.post(
          `${API_BASE_URL}/remove`,
          { userId, productId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        console.error("❌ Failed to remove item:", error);
      }
    } else {
      localStorage.setItem("cart", JSON.stringify(updatedCart));
    }
  };


  // ✅ Update Item Quantity in Cart
  const updateQuantity = async (userId, productId, quantity) => {
    let updatedCart = cart.map((item) =>
      item._id === productId ? { ...item, quantity } : item
    );

    console.log("🟢 Updated Cart:", { userId, productId, quantity });

    setCart(updatedCart);
    updateCartCount(updatedCart.length);
    localStorage.setItem("cart", JSON.stringify(updatedCart));

    if (token) {
      try {
        await axios.post(
          `${API_BASE_URL}/update`,
          { userId, productId, quantity },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        console.error("❌ Failed to update cart quantity:", error);
      }
    } else {
      localStorage.setItem("cart", JSON.stringify(updatedCart));
    }
  };

  // // ✅ Sync Cart with Database
  // const syncCartWithDB = useCallback(async () => {
  //   if (!token) return; // Ensure the user is logged in

  //   try {
  //     const user = JSON.parse(localStorage.getItem("user"));
  //     if (!user.id) return;

  //     await axios.post(
  //       `${API_BASE_URL}/sync`,
  //       { userId: user.id, cart }, // Pass userId
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );

  //     console.log("✅ Cart synced successfully!");
  //   } catch (error) {
  //     console.error("❌ Failed to sync cart:", error);
  //   }
  // }, [cart, token]);

  // useEffect(() => {
  //   if (token) syncCartWithDB();
  // }, [cart, syncCartWithDB, token]);

  return (
    <CartContext.Provider value={{ cart, setCart, cartCount, addToCart, removeFromCart, updateQuantity }}>

      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

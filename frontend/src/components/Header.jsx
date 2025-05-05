import React, { useState, useEffect } from "react";
import "./Header.css";
import { FaShoppingCart, FaTruck, FaBars, FaTimes, FaSignOutAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useCart } from "./CartContext";
import axios from "axios";

const Header = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [sidebar, setSidebar] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [loginData, setLoginData] = useState({ email: "", password: "", rememberMe: false });
  const [registerData, setRegisterData] = useState({ fullName: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [user, setUser] = useState(null);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [updatedName, setUpdatedName] = useState("");
  const [updatedEmail, setUpdatedEmail] = useState("");
  const [updatedPhone, setUpdatedPhone] = useState("");
  const [totalOrders, setTotalOrders] = useState(0);
  const [cartItems, setCartItems] = useState([]);
const [showCartItems, setShowCartItems] = useState(false);


  const { cartCount } = useCart();
  const userId = loggedInUser?._id;

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setLoggedInUser(parsed);
      setUpdatedName(parsed.name || "");
      setUpdatedEmail(parsed.email || "");
      setUpdatedPhone(parsed.phone || "");
    }
  }, []);



  useEffect(() => {
    if (loggedInUser?.name) {
      setUpdatedName(loggedInUser.name);
    }
  }, [loggedInUser]);
  

  // Close modal & sidebar when clicking outside
  useEffect(() => {
    const closeOnOutsideClick = (e) => {
      if (
        sidebar && !e.target.closest(".sidebar") && !e.target.closest(".menu-icon")
      ) {
        setSidebar(false);
      }

      if (
        showAuthModal && !e.target.closest(".auth-box") && !e.target.closest(".login-btn")
      ) {
        setShowAuthModal(false);
      }
    };

    document.addEventListener("click", closeOnOutsideClick);
    return () => document.removeEventListener("click", closeOnOutsideClick);
  }, [sidebar, showAuthModal]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setLoggedInUser(parsed);
        console.log("User from localStorage:", parsed);
      } catch (err) {
        console.error("Failed to parse user from localStorage", err);
      }
    }
  }, []);
  

   useEffect(() => {
    const fetchUserOrders = async () => {
      if (loggedInUser?._id) {
        try {
          const response = await fetch(`http://localhost:8500/api/orders/user/${loggedInUser._id}`);
          const data = await response.json();
          if (response.ok) {
            setTotalOrders(data.length);
          }
        } catch (error) {
          console.error("Error fetching orders:", error);
        }
      }
    };
    fetchUserOrders();
  }, [loggedInUser]);

  const checkCart = async () => {
    setShowCartItems(!showCartItems); // Toggle visibility
  
    if (!showCartItems) {
      try {
        const res = await axios.get(`/api/cart/${loggedInUser._id}`);
        setCartItems(res.data); // Assuming API returns array of items
      } catch (err) {
        console.error("Failed to fetch cart", err);
      }
    }
  };
  
  
  const handleProfileUpdate = async () => {
    console.log("Update button clicked");
    const userId = loggedInUser?.customerID;  // Make sure customerID is correct
  
    if (!userId) return;
  
    try {
      const formData = new FormData();
      formData.append("name", updatedName);
      formData.append("email", updatedEmail);
      formData.append("phone", updatedPhone);
  
      if (profileImage) {
        formData.append("profileImage", profileImage);  // Make sure it's the file object
      }
  
      const response = await axios.put(`http://localhost:8500/api/customer/update/${userId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
  
      if (response.status === 200) {
        console.log("Profile update response:", response.data);
        const updatedCustomer = response.data;
        setLoggedInUser(updatedCustomer);  // Update logged-in user state
        localStorage.setItem("user", JSON.stringify(updatedCustomer));  // Save to localStorage
        setEditMode(false);  // Exit edit mode
        setProfileImage(null);  // Clear profile image state
        alert("Profile updated successfully");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    }
  };
  
  
  // Form validation for registration
  const validateRegister = () => {
    let newErrors = {};
    if (!registerData.fullName.trim()) newErrors.fullName = "Full Name is required";
    if (!registerData.email.includes("@")) newErrors.email = "Invalid email";
    if (registerData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (registerData.password !== registerData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handles login form submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8500/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();
      console.log("Response:", response.status, data);  // Debugging log

      if (response.ok) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user)); // ✅ Save to localStorage
        setLoggedInUser(data.user); // ✅ Update loggedInUser as well
        alert("Login successful");
      }
       else {
        alert(`Login failed: ${data.message}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Login failed. Server not responding.");
    }
  };


  // Handles registration form submission
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    if (!validateRegister()) {
      return; // Stop if validation fails
    }

    try {
      const response = await fetch("http://localhost:8500/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registration successful");
      } else {
        alert(`Registration failed: ${data.message}`);
      }
    } catch (error) {
      alert("Registration failed. Server not responding.");
      console.error("Error:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("cart");  
    setLoggedInUser(false);
    setUser(null);
    alert("You have been logged out");
  };
  

  return (
    <>
      {/* Overlay for Sidebar & Modal */}
      {(sidebar || showAuthModal) && <div className="overlay" onClick={() => { setSidebar(false); setShowAuthModal(false); }}></div>}

      <header className="navbar">
        <div className="logo" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <img src="https://cdn-icons-png.flaticon.com/128/3512/3512754.png" alt="Cart Logo" width="40" height="40" />
          <Link to="/" style={{ textDecoration: "none", fontSize: "24px", fontWeight: "bold", color: "#333" }}>
            urniCart
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          <ul className="nav-links">
            <li><Link to="/products/Sofa">Sofas</Link></li>
            <li><Link to="/products/BeanBags">Bean Bags</Link></li>
            <li><Link to="/products/Chair">Chairs</Link></li>
            <li><Link to="/products/Shoe">Shoe Racks</Link></li>
            <li><Link to="/products/Bedroom">Bedroom Sets</Link></li>
            <li><Link to="/products/Dining">Dining Sets</Link></li>
            <li><Link to="/products/Table">Study Tables</Link></li>
            <li><Link to="/products/Wardrobes">Wardrobes</Link></li>
            <li><Link to="/products/Book">Book Shelves</Link></li>
          </ul>
        </nav>

        {/* Icons & Login Button */}
        <div className="icons">
        {loggedInUser && loggedInUser.email ? (
  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
   <span onClick={() => setShowProfilePopup(!showProfilePopup)} style={{ cursor: "pointer" }}>
  Welcome, {loggedInUser.name}
</span>

{showProfilePopup && (
  <div className="modern-profile-popup">
    <div className="profile-container">
      <button className="close-button" onClick={() => setShowProfilePopup(false)}>&times;</button>

      <div className="profile-header">
        <div className="image-circle">
          <img
            src={loggedInUser.profileImage || "https://cdn-icons-png.flaticon.com/512/847/847969.png"}
            alt="User Icon"
            className="profile-avatar"
          />
          {/* <label className="edit-photo">
            ✎
            <input type="file" accept="image/*" onChange={(e) => setProfileImage(e.target.files[0])} />
          </label> */}
        </div>
        <h2>{loggedInUser.name}</h2>
      </div>

      <div className="profile-fields">
        {editMode ? (
          <>
            <div><label>Full Name</label><input value={updatedName} onChange={(e) => setUpdatedName(e.target.value)} /></div>
            <div><label>Email</label><input type="email" value={updatedEmail} onChange={(e) => setUpdatedEmail(e.target.value)} /></div>
            <div><label>Phone</label><input type="tel" value={updatedPhone} onChange={(e) => setUpdatedPhone(e.target.value)} /></div>
            <button className="save-btn" onClick={handleProfileUpdate}>Save</button>
          </>
        ) : (
          <>
            <div><label>Email</label><p>{loggedInUser.email}</p></div>
            <div><label>Phone</label><p>{loggedInUser.phone}</p></div>
            <div><label>Cart Items</label><p>{cartCount}</p></div>
          </>
        )}
      </div>

      <div className="profile-actions">
        {/* <button onClick={() => setEditMode(!editMode)} className="edit-btn">
          {editMode ? "Cancel" : "Edit Profile"}
        </button> */}
        {/* <button onClick={checkCart} className="edit-btn">Check Cart</button> */}

        <button onClick={handleLogout} className="edit-btn">Logout</button>
      </div>
    </div>
  </div>
)}
{showCartItems && (
  <div className="cart-section">
    <h3>Your Cart Items</h3>
    {cartItems.length > 0 ? (
      <ul className="cart-items-list">
        {cartItems.map((item, index) => (
          <li key={index} className="cart-item">
            <img src={item.image} alt={item.name} className="cart-item-img" />
            <div className="cart-item-details">
              <p><strong>Name:</strong> {item.name}</p>
              <p><strong>Price:</strong> ₹{item.discountPrice}</p>
              <p><strong>Quantity:</strong> {item.quantity}</p>
              <p><strong>Category:</strong> {item.category}</p>
            </div>
          </li>
        ))}
      </ul>
    ) : (
      <p>No items in your cart.</p>
    )}
  </div>
)}




    <FaSignOutAlt
      title="Logout"
      className="logout-icon"
      onClick={handleLogout}
      style={{ cursor: "pointer", fontSize: "20px" }}
    />
  </div>
) : (
  <button className="login-btn">
    <Link to="/login" className="login-link">Login/Register</Link>
  </button>
)}


          <div className="cartIcon">
            <a href="/cart" className="cart-icon">
              <FaShoppingCart />
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </a>
          </div>

          <a href="/tracking" className="track-icon"><FaTruck /></a>
        </div>

        {/* Sidebar Toggle Button for Mobile */}
        <div className="menu-icon" onClick={() => setSidebar(true)}>
          <FaBars />
        </div>
      </header>

      {/* Sidebar for Mobile */}
      <div className={`sidebar ${sidebar ? "show" : ""}`}>
        <div className="close-btn" onClick={() => setSidebar(false)}>
          <FaTimes />
        </div>
        <Link to="/products/Sofa" onClick={() => setSidebar(false)}>Sofa</Link>
        <Link to="/products/BeanBags" onClick={() => setSidebar(false)}>BeanBags</Link>
        <Link to="/products/Chair" onClick={() => setSidebar(false)}>Chair</Link>
        <Link to="/products/Shoe" onClick={() => setSidebar(false)}>Shoe</Link>
        <Link to="/products/Bedroom" onClick={() => setSidebar(false)}>Bedroom</Link>
        <Link to="/products/Dining" onClick={() => setSidebar(false)}>Dining</Link>
        <Link to="/products/Table" onClick={() => setSidebar(false)}>Study Table </Link>
        <Link to="/products/Wardrobes" onClick={() => setSidebar(false)}>Wardrobes </Link>
        <Link to="/products/Book" onClick={() => setSidebar(false)}>Book Shelfs </Link>
        <a href="/tracking" className="track-icon"><FaTruck /></a>

      </div>


      {/* Login/Register Modal */}
      {showAuthModal && (
        <div className="auth-modal">
          <div className="auth-box">
            <button className="close-auth" onClick={() => setShowAuthModal(false)}>
              <FaTimes />
            </button>

            {/* Tabs */}
            <div className="auth-tabs">
              <button
                className={activeTab === "login" ? "active" : ""}
                onClick={() => setActiveTab("login")}
              >
                Login
              </button>
              <button
                className={activeTab === "register" ? "active" : ""}
                onClick={() => setActiveTab("register")}
              >
                Register
              </button>
            </div>

            {/* Form Content */}
            {activeTab === "login" ? (
              <div className="auth-content">
                <h2>Login</h2>
                <form onSubmit={handleLoginSubmit}>
                  <input type="email" placeholder="Email" value={loginData.email} onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} required />
                  <input type="password" placeholder="Password" value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} required />
                  <button type="submit">Login</button>
                </form>
              </div>
            ) : (
              <div className="auth-content">
                <h2>Register</h2>
                <form onSubmit={handleRegisterSubmit}>
                  <input type="text" placeholder="Full Name" value={registerData.fullName} onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })} required />
                  <input type="email" placeholder="Email" value={registerData.email} onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })} required />
                  <input type="password" placeholder="Password" value={registerData.password} onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })} required />
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                    required
                  />
                  {errors.confirmPassword && <p className="error">{errors.confirmPassword}</p>}

                  <button type="submit">Register</button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Header;

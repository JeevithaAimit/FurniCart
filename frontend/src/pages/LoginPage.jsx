import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import "./Login.css";

const API_BASE_URL = "http://localhost:8500/api/auth/";

const LoginPage = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId"); // ✅ Check userId too
    if (token && userId) {
      setIsLoggedIn(true);
    }
  }, []);


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Register function
  const handleRegister = async (e) => {
    e.preventDefault();
    setError(""); // Reset error state

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}register`, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });

      alert(response.data.message);
      setIsRegistering(false);
      setFormData({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
    } catch (error) {
      setError(error.response?.data?.message || "Registration failed");
    }
  };

  // ✅ Login function
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}login`, {
        email: formData.email,
        password: formData.password,
      }, {
        headers: { "Content-Type": "application/json" } // ✅ Ensure JSON format
      });

      console.log("✅ Login Response:", response.data);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.customer)); // Store user data
      navigate("/");
    } catch (error) {
      console.error("❌ Login Error:", error.response?.data || error);
      setError(error.response?.data?.message || "Login failed");
    }
  };



  // ✅ Logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId"); // ✅ Remove userId
    setIsLoggedIn(false);
    navigate("/login");
  };


  return (
    <div className="login-container">
      {isLoggedIn ? (
        <div className="logout-section">
          <h2>Welcome Back!</h2>
          <p>You're logged in.</p>
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt className="logout-icon" />
          </button>
        </div>
      ) : (
        <div className={`form-container ${isRegistering ? "register-mode" : ""}`}>
          <h2>{isRegistering ? "Register" : "Login"}</h2>
          {error && <p className="error-message">{error}</p>}

          <form onSubmit={isRegistering ? handleRegister : handleLogin}>
            {isRegistering && (
              <>
                <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
                <input type="tel" name="phone" placeholder="Phone No" value={formData.phone} onChange={handleChange} required />
              </>
            )}
            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />

            <div className="password-container">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            {isRegistering && (
              <div className="password-container">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <span className="eye-icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            )}

            <button type="submit">{isRegistering ? "Register" : "Login"}</button>
            <p onClick={() => setIsRegistering(!isRegistering)} className="toggle-link">
              {isRegistering ? "Already have an account? Login" : "New user? Register"}
            </p>
          </form>
        </div>
      )}
    </div>
  );
};

export default LoginPage;

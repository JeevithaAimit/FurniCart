import React, { useState, useEffect } from "react";
import axios from "axios";
import "./dashboard.css";
import { FaUsers, FaBox, FaShoppingCart, FaBars, FaTimes, FaRupeeSign, FaSignOutAlt } from "react-icons/fa";
import AddProduct from "./AddProduct";
import Inventory from "./Inventory";
import OrderManagement from "./orderDetails";
import CustomerDetails from "./CustomerDetails";
import Order from "./Order";
import { useNavigate } from "react-router-dom"; // Import navigation

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [orders, setOrders] = useState([]); // Stores orders
  // State for statistics
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalSalesPrice, setTotalSalesPrice] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(true); // State for loading
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("isAuthenticated")) {
      navigate("/login");
    }
    setLoading(true); // Set loading to true when starting the fetch
    fetchInventoryData();
    fetchTotalCustomers();
    fetchTotalOrders();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate("/login");
  };

  // ✅ Fetch total products and total sales
  const fetchInventoryData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/products");
      if (!Array.isArray(response.data)) throw new Error("Invalid response format");

      let totalProductsCount = response.data.length;
      let totalSales = response.data.reduce((acc, item) => acc + (parseFloat(item.price) || 0), 0);

      setTotalProducts(totalProductsCount);
      setTotalSalesPrice(totalSales);
    } catch (error) {
      console.error("❌ Error fetching inventory data:", error);
    }
  };

  // ✅ Fetch total customers
  const fetchTotalCustomers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/customers");
      if (!Array.isArray(response.data)) throw new Error("Invalid response format");
  
      setTotalCustomers(response.data.length); // ✅ Correctly set total customers
    } catch (error) {
      console.error("❌ Error fetching customer count:", error);
    }
  };
  

  // ✅ Fetch total orders
  const fetchTotalOrders = async () => {
    try {
      const response = await axios.get("http://localhost:5000/orders");
      if (!Array.isArray(response.data)) throw new Error("Invalid response format");

      setTotalOrders(response.data.length);
      setOrders(response.data); // Store order details

      // Calculate the total price from the orders (this is optional since you're already getting totalPrice from the backend)
      const totalOrderPrice = response.data.reduce((acc, order) => acc + (parseFloat(order.totalPrice) || 0), 0);
      
      setTotalSalesPrice(totalOrderPrice); // Set total sales price from all orders
    } catch (error) {
      console.error("❌ Error fetching total orders:", error);
    } finally {
      setLoading(false); // Set loading to false after fetch completes
    }
  };



  // ✅ Format rupees in lakhs
  const formatRupeesInLakhs = (value) =>
    value >= 100000 ? `₹${(value / 100000).toFixed(1)}L` : `₹${value.toLocaleString()}`;

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <button className="close-btn" onClick={() => setSidebarOpen(false)}>
          <FaTimes />
        </button>
        <div className="dashboard">
          <h2>Admin Panel</h2>
        </div>
        <ul>
  {["dashboard", "customers", "orders", "addProduct", "inventory", "orderManagement"].map((section) => (
    <li key={section}>
      <button
        className={`sidebar-btn ${activeSection === section ? "active" : ""}`}
        onClick={() => setActiveSection(section)}
      >
        {section.charAt(0).toUpperCase() + section.slice(1)} {/* Optional: You can make this friendlier */}
      </button>
    </li>
  ))}
</ul>
        <button
          className="sidebar-btn"
          onClick={() => window.open("http://localhost:3002/", "_blank")}
        >
           Manager Login
        </button>

        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
          <FaBars />
        </button>

        {/* Dashboard Cards */}
        {activeSection === "dashboard" && (
          <div className="stats">
            <div className="card">
              <FaUsers className="icon" />
              <h3>Total Customers</h3>
              <p>{totalCustomers}</p>
            </div>

            <div className="card">
              <FaShoppingCart className="icon" />
              <h3>Total Orders</h3>
              <p>{totalOrders}</p>
            </div>

            <div className="card">
              <FaBox className="icon" />
              <h3>Total Products</h3>
              <p>{totalProducts}</p>
            </div>

            <div className="card">
              <FaRupeeSign className="icon" />
              <h3>Total Sales</h3>
              <p>{formatRupeesInLakhs(totalSalesPrice)}</p>
            </div>
          </div>
        )}

        {/* Render Components Based on Active Section */}
        {activeSection === "customers" && <CustomerDetails />}
        {activeSection === "addProduct" && <AddProduct />}
        {activeSection === "inventory" && <Inventory totalProducts={totalProducts} totalSalesPrice={totalSalesPrice} />}
        {activeSection === "orders" && !loading && <Order orders={orders} />}
        {activeSection === "orderManagement" && < OrderManagement/>}

        {activeSection === "orders" && loading && <p>Loading orders...</p>} {/* Loading state */}
      </div>
    </div>
  );
};

export default Dashboard;

import React, { useEffect, useState } from "react";
import { Routes, Route, Link, useNavigate, Navigate } from "react-router-dom";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import "./ManagerPanel.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserCircle,
  faTachometerAlt,
  faShoppingCart,
  faBoxes,
  faShippingFast,
  faCheckCircle,
  faMoneyBillWave,
  faComments,
  faStarHalfAlt,
  faSignOutAlt,
  faUserShield,
  faChevronDown,
  faChevronRight,
  faBars,
  faTimes
} from "@fortawesome/free-solid-svg-icons";
import { FaUserEdit, FaUserTag, FaCheck, FaTimes as FaTimesIcon } from "react-icons/fa";
import Package from "./Package";
import Payment from "./Payment";
import Shipping from "./Shipping";
import Deliver from "./Delivery";
import Order from "./Order";
import Account from "./Account";
import Feedback from "./Feedback";
import Review from "./Review";
import OrderManagement from "./OrderManagement";


ChartJS.register(ArcElement, Tooltip, Legend);

// 🔹 Sidebar
const Sidebar = ({ onLogout, onClose }) => {
  const [ordersDropdown, setOrdersDropdown] = useState(false);
  const [financeDropdown, setFinanceDropdown] = useState(false);
  const [manager, setManager] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [showProfilePicPopup, setShowProfilePicPopup] = useState(false);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();


  const fetchManagerData = async () => {
    const managerId = localStorage.getItem("managerId");
    if (managerId) {
      try {
        const res = await axios.get(`http://localhost:8000/api/managers/${managerId}`);
        setManager(res.data);
      } catch (err) {
        console.error("Failed to fetch manager:", err);
      }
    }
  };

  useEffect(() => {
    fetchManagerData();
  }, []);

  const handleProfilePicUpload = async () => {
    if (!profilePicFile) return;
    const formData = new FormData();
    formData.append("profilePic", profilePicFile);

    try {
      const res = await axios.put(`http://localhost:8000/api/managers/${manager._id}/profile-pic`, formData);
      setManager((prevManager) => ({
        ...prevManager,
        profilePic: res.data.profilePic,
      }));
      setShowProfilePicPopup(false);
      setProfilePicFile(null);
    } catch (err) {
      alert("Failed to update profile picture");
    }
  };

  const handleAdminLogin = async () => {
    const ports = [3002, 3000];
    for (let port of ports) {
      const url = `http://localhost:${port}`;
      try {
        const response = await fetch(url, { method: "HEAD" });
        if (response.ok) {
          window.location.href = url;
          return;
        }
      } catch (err) {
        console.log(`Server on port ${port} is not available.`);
      }
    }
    alert("None of the Admin Login servers are available.");
  };


  const handleCloseSidebar = () => {
  setShowSidebar(false);
};

  return (
    <div className="sidebar-inner">
      {/* Close button for mobile */}
      <button className="close-sidebar-btn" onClick={onClose}>
        <FontAwesomeIcon icon={faTimes} />
      </button>

      {manager && (
        <div
          className="top-profile"
          onClick={() => setShowPopup(true)}
          style={{ cursor: "pointer" }}
        >
          <img
            src={manager.profilePic || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
            alt="User Icon"
            className="manager-avatar"
          />
          <h2 className="managerName">{manager.name}</h2>
        </div>
      )}
      <nav className="sidebar-nav">
        <ul>
          <li>
            <Link to="/dashboard" onClick={onClose}>
              <FontAwesomeIcon icon={faTachometerAlt} className="nav-icon" />
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link to="/dashboard/orderManagement" onClick={onClose}>
              <FontAwesomeIcon icon={faShoppingCart} className="nav-icon" />
              <span>Order Management</span>
            </Link>
          </li>
          
          <li className="dropdown">
            <button onClick={() => setOrdersDropdown(!ordersDropdown)} className="dropdown-btn">
              <div>
                <FontAwesomeIcon icon={faBoxes} className="nav-icon" />
                <span>Our Orders</span>
              </div>
              <FontAwesomeIcon 
                icon={ordersDropdown ? faChevronDown : faChevronRight} 
                className="dropdown-icon"
              />
            </button>
            {ordersDropdown && (
              <ul className="dropdown-menu">
                <li>
                  <Link to="/dashboard/package" onClick={onClose}>
                    <FontAwesomeIcon icon={faBoxes} className="nav-icon" />
                    <span>Package</span>
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard/shipping" onClick={onClose}>
                    <FontAwesomeIcon icon={faShippingFast} className="nav-icon" />
                    <span>Shipping</span>
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard/delivered" onClick={onClose}>
                    <FontAwesomeIcon icon={faCheckCircle} className="nav-icon" />
                    <span>Delivered</span>
                  </Link>
                </li>
              </ul>
            )}
          </li>

          <li className="dropdown">
            <button onClick={() => setFinanceDropdown(!financeDropdown)} className="dropdown-btn">
              <div>
                <FontAwesomeIcon icon={faMoneyBillWave} className="nav-icon" />
                <span>Finance</span>
              </div>
              <FontAwesomeIcon 
                icon={financeDropdown ? faChevronDown : faChevronRight} 
                className="dropdown-icon"
              />
            </button>
            {financeDropdown && (
              <ul className="dropdown-menu">
                <li>
                  <Link to="/dashboard/account" onClick={onClose}>
                    <FontAwesomeIcon icon={faMoneyBillWave} className="nav-icon" />
                    <span>Our Accounts</span>
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard/payment" onClick={onClose}>
                    <FontAwesomeIcon icon={faMoneyBillWave} className="nav-icon" />
                    <span>Customer Payment</span>
                  </Link>
                </li>
              </ul>
            )}
          </li>

          <li>
            <Link to="/dashboard/feedback" onClick={onClose}>
              <FontAwesomeIcon icon={faComments} className="nav-icon" />
              <span>Feedback</span>
            </Link>
          </li>
          <li>
            <Link to="/dashboard/reviews" onClick={onClose}>
              <FontAwesomeIcon icon={faStarHalfAlt} className="nav-icon" />
              <span>Product Reviews</span>
            </Link>
          </li>
        </ul>
      </nav>
      <div className="sidebar-buttons">
        <button onClick={handleAdminLogin} className="admin-login">
          <FontAwesomeIcon icon={faUserShield} />
          <span>Admin Login</span>
        </button>
        <button onClick={onLogout} className="logout-btn">
          <FontAwesomeIcon icon={faSignOutAlt} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

// 🔹 Dashboard
const Dashboard = () => {
  const [totalOrders, setTotalOrders] = useState(0);
  const [deliveredOrders, setDeliveredOrders] = useState(0);
  const [rejectedOrders, setRejectedOrders] = useState(0);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const [totalRes, deliveredRes, rejectedRes] = await Promise.all([
          axios.get("http://localhost:8000/api/total-orders"),
          axios.get("http://localhost:8000/api/orders/delivered"),
          axios.get("http://localhost:8000/api/rejected-orders/count"),
        ]);

        setTotalOrders(totalRes.data.totalOrders);
        setDeliveredOrders(deliveredRes.data.length || 0);
        setRejectedOrders(rejectedRes.data.rejectedCount);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="dashboard">
      <h1>Dashboard Overview</h1>
      <div className="dashboard-content">
        <div className="cards">
          <div className="card">
            <h3>
              <FontAwesomeIcon icon={faShoppingCart} />
              Total Orders
            </h3>
            <span className="count">{totalOrders}</span>
          </div>
          <div className="card">
            <h3>
              <FontAwesomeIcon icon={faCheckCircle} />
              Delivered Orders
            </h3>
            <span className="count">{deliveredOrders}</span>
          </div>
          <div className="card">
            <h3>
              <FontAwesomeIcon icon={faTimes} />
              Rejected Orders
            </h3>
            <span className="count">{rejectedOrders}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// 🔹 Manager Panel
const ManagerPanel = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true); // Start with sidebar open

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="manager-panel">
      {/* Sidebar Toggle Button (only visible on mobile) */}
      <button className="open-sidebar-btn" onClick={() => setSidebarOpen(true)}>
        <FontAwesomeIcon icon={faBars} />
      </button>

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
       <Sidebar 
  onLogout={handleLogout}
  onClose={() => setSidebarOpen(false)}
/>

      </div>

      {/* Overlay (only visible on mobile when sidebar is open) */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className={`content ${!sidebarOpen ? 'full-width' : ''}`}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="package" element={<Package />} />
          <Route path="shipping" element={<Shipping />} />
          <Route path="shipping/:orderId" element={<Shipping />} />
          <Route path="delivered" element={<Deliver />} />
          <Route path="feedback" element={<Feedback />} />
          <Route path="payment" element={<Payment />} />
          <Route path="order" element={<Order />} />
          <Route path="account" element={<Account />} />
          <Route path="orderManagement" element={<OrderManagement />} />
          <Route path="reviews" element={<Review />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </div>
  );
};

export default ManagerPanel;


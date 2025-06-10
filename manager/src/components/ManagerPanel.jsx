import React, { useEffect, useState } from "react";
import { Routes, Route, Link, useNavigate, Navigate } from "react-router-dom";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import "./ManagerPanel.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCircle } from "@fortawesome/free-solid-svg-icons";
import { FaUserEdit, FaUserTag, FaSignOutAlt, FaCheck, FaTimes, FaCamera } from "react-icons/fa";
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

// Sidebar Component
const Sidebar = ({ onLogout, onClose, className = '' }) => {
  const [ordersDropdown, setOrdersDropdown] = useState(false);
  const [financeDropdown, setFinanceDropdown] = useState(false);
  const [manager, setManager] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [showProfilePicPopup, setShowProfilePicPopup] = useState(false);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const navigate = useNavigate();

  const fetchManagerData = async () => {
    const managerId = localStorage.getItem("managerId");
    if (managerId) {
      try {
        const res = await axios.get(`http://localhost:8000/api/managers/${managerId}`);
        setManager(res.data);
        setNewName(res.data.name);
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
    alert("None of the Admin Login servers (3001, 3002, 3000) are available.");
  };

  return (
    <>
      <div className={`sidebar ${className}`}>
        <div className="sidebar-header">
          <button className="close-sidebar-btn" onClick={onClose}>✖</button>
        </div>
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
        <ul>
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><Link to="/dashboard/orderManagement">Order Management</Link></li>
          <li className="dropdown">
            <button onClick={() => setOrdersDropdown(!ordersDropdown)} className="dropdown-btn">
              Our Orders ▼
            </button>
            {ordersDropdown && (
              <ul className="dropdown-menu">
                <li><Link to="/dashboard/package">Package</Link></li>
                <li><Link to="/dashboard/shipping">Shipping</Link></li>
                <li><Link to="/dashboard/delivered">Delivered</Link></li>
              </ul>
            )}
          </li>
          <li className="dropdown">
            <button onClick={() => setFinanceDropdown(!financeDropdown)} className="dropdown-btn">
              Finance ▼
            </button>
            {financeDropdown && (
              <ul className="dropdown-menu">
                <li><Link to="/dashboard/account">Our Accounts</Link></li>
                <li><Link to="/dashboard/payment">Customer Payment</Link></li>
              </ul>
            )}
          </li>
          <li><Link to="/dashboard/feedback">Feedback</Link></li>
          <li><Link to="/dashboard/reviews">Product Reviews</Link></li>
          <li>
            <button onClick={handleAdminLogin} className="admin-login">Admin Login</button>
          </li>
          <li>
            <button onClick={onLogout} className="logout-btn">Logout</button>
          </li>
        </ul>
      </div>

      {/* Profile Popup */}
      {showPopup && manager && (
        <div className="popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowPopup(false)}>✖</button>
            <h2>
              {isEditingName ? (
                <div className="edit-name-popup">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="edit-name-input"
                  />
                  <div className="edit-name-actions">
                    <button
                      className="icon-btn"
                      onClick={async () => {
                        try {
                          const res = await axios.put(
                            `http://localhost:8000/api/managers/${manager._id}/name`,
                            { name: newName }
                          );
                          setManager(res.data);
                          setIsEditingName(false);
                        } catch {
                          alert("Failed to update name");
                        }
                      }}
                    >
                      <FaCheck />
                    </button>
                    <button
                      className="icon-btn"
                      onClick={() => setIsEditingName(false)}
                    >
                      <FaTimes />
                    </button>
                  </div>
                </div>
              ) : manager.name}
            </h2>
            <p><strong>Email:</strong> {manager.email}</p>
            <p><strong>Phone:</strong> {manager.phone}</p>
            <div className="popup-actions-icon">
              <button
                className="icon-btn"
                title="Edit Name"
                onClick={() => {
                  setIsEditingName(true);
                  setNewName(manager.name);
                }}
              >
                <FaUserTag />
              </button>
              <button
                className="icon-btn"
                title="Change Profile Picture"
                onClick={() => setShowProfilePicPopup(true)}
              >
                <FaCamera />
              </button>
              <button
                className="icon-btn"
                title="Logout"
                onClick={() => {
                  localStorage.clear();
                  navigate("/");
                }}
              >
                <FaSignOutAlt />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Picture Upload Popup */}
      {showProfilePicPopup && (
        <div className="popup-overlay" onClick={() => setShowProfilePicPopup(false)}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowProfilePicPopup(false)}>✖</button>
            <h2>Upload Profile Picture</h2>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProfilePicFile(e.target.files[0])}
            />
            <button
              className="icon-btn"
              onClick={handleProfilePicUpload}
              disabled={!profilePicFile}
            >
              Upload
            </button>
          </div>
        </div>
      )}
    </>
  );
};

// Dashboard Component
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

  const chartData = {
    labels: ["Total Orders", "Delivered Orders", "Rejected Orders"],
    datasets: [{
      data: [totalOrders, deliveredOrders, rejectedOrders],
      backgroundColor: ["#36A2EB", "#4CAF50", "#FF6384"],
    }],
  };

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="dashboard-content">
        <div className="cards">
          <div className="card">
            Total Orders<br />
            <span className="count">{totalOrders}</span>
          </div>
          <div className="card">
            Delivered Orders<br />
            <span className="count">{deliveredOrders}</span>
          </div>
          <div className="card">
            Rejected Orders<br />
            <span className="count">{rejectedOrders}</span>
          </div>
        </div>
        <div className="chart"><Pie data={chartData} /></div>
      </div>
    </div>
  );
};

// Manager Panel Component
const ManagerPanel = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 600);

const handleLogout = async () => {
  const managerId = localStorage.getItem("managerId");
  if (managerId) {
    try {
      await axios.put(`http://localhost:8000/api/managers/${managerId}/status`, {
        status: "offline",
      });
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  }

  localStorage.clear();
  navigate("/");
};


  return (
    <div className="manager-panel">
      <Sidebar className={sidebarOpen ? 'open' : ''} onLogout={handleLogout} onClose={() => setSidebarOpen(false)} />
      {!sidebarOpen && (
        <button className="open-sidebar-btn" onClick={() => setSidebarOpen(true)}>
          ☰
        </button>
      )}
      <div className="content">
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
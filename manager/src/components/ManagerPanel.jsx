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
    <ul className={`dropdown-menu ${ordersDropdown ? 'show' : ''}`}>
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
             <ul className={`dropdown-menu ${financeDropdown ? 'show' : ''}`}>
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
  const [shippedOrders, setShippedOrders] = useState(0);
  const [packedOrders, setPackedOrders] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const [
          totalRes, 
          deliveredRes, 
          rejectedRes, 
          shippedRes, 
          packedRes
        ] = await Promise.all([
          axios.get("http://localhost:8000/api/total-orders"),
          axios.get("http://localhost:8000/api/orders/delivered"),
          axios.get("http://localhost:8000/api/rejected-orders/count"),
          axios.get("http://localhost:8000/api/orders/shipped"),
          axios.get("http://localhost:8000/api/orders/packed"),
        ]);
        
        setTotalOrders(totalRes.data.totalOrders);
        setDeliveredOrders(deliveredRes.data.length || 0);
        setRejectedOrders(rejectedRes.data.rejectedCount);
        setShippedOrders(shippedRes.data.length || 0);
        setPackedOrders(packedRes.data.length || 0);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const chartData = {
    labels: ["Total Orders", "Delivered Orders", "Rejected Orders", "Shipped Orders", "Packed Orders"],
    datasets: [{
      data: [totalOrders, deliveredOrders, rejectedOrders, shippedOrders, packedOrders],
      backgroundColor: ["#36A2EB", "#4CAF50", "#FF6384", "#FFCE56", "#9966FF"],
    }],
  };
  
return (
  <div className="dashboard">
    <h1>Dashboard Overview</h1>
    {loading ? (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    ) : (
      <>
        <div className="dashboard-content">
          <div className="cards">
            <div className="card card-total">
              <div className="card-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 13h1v7c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-7h1a1 1 0 0 0 .707-1.707l-9-9a.999.999 0 0 0-1.414 0l-9 9A1 1 0 0 0 3 13zm9-8.586L18.586 11H16c-1.103 0-2 .897-2 2v7h-4v-7c0-1.103-.897-2-2-2H5.586L12 4.414z"></path>
                </svg>
              </div>
              <div className="card-content">
                <h3>Total Orders</h3>
                <span className="count">{totalOrders}</span>
              </div>
            </div>
            
            {/* Add the new Packed card here */}
            <div className="card card-packed">
              <div className="card-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2zM5 19V5h14l.002 14H5z"></path>
                  <path d="M10 14h4v-4h-4v4zm0-5h4V7h-4v2z"></path>
                </svg>
              </div>
              <div className="card-content">
                <h3>Packed</h3>
                <span className="count">{packedOrders}</span>
              </div>
            </div>
            
            <div className="card card-delivered">
              <div className="card-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.965 8.521C19.988 8.347 20 8.173 20 8c0-2.379-2.143-4.288-4.521-3.965C14.786 2.802 13.466 2 12 2s-2.786.802-3.479 2.035C6.138 3.712 4 5.621 4 8c0 .173.012.347.035.521C2.802 9.214 2 10.534 2 12s.802 2.786 2.035 3.479A3.976 3.976 0 0 0 4 16c0 2.379 2.138 4.288 4.521 3.965C9.214 21.198 10.534 22 12 22s2.786-.802 3.479-2.035C17.857 20.288 20 18.379 20 16c0-.173-.012-.347-.035-.521C21.198 14.786 22 13.466 22 12s-.802-2.786-2.035-3.479zm-9.01 7.895l-3.667-3.714 1.424-1.404 2.257 2.286 4.327-4.294 1.408 1.42-5.749 5.706z"></path>
                </svg>
              </div>
              <div className="card-content">
                <h3>Delivered</h3>
                <span className="count">{deliveredOrders}</span>
              </div>
            </div>
            
            <div className="card card-shipped">
              <div className="card-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 15h-3v-3c0-.551-.449-1-1-1h-4c-.551 0-1 .449-1 1v3H5v-3H3v3H1v2h2v3h2v-3h3v3h1v-3h4v3h1v-3h3v3h2v-3h2v-2h-2v-3zm-4-2h2v2h-2v-2zm-8 0h2v2H7v-2z"></path>
                </svg>
              </div>
              <div className="card-content">
                <h3>Shipped</h3>
                <span className="count">{shippedOrders}</span>
              </div>
            </div>
            
            <div className="card card-rejected">
              <div className="card-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm4.207 12.793l-1.414 1.414L12 13.414l-2.793 2.793-1.414-1.414L10.586 12 7.793 9.207l1.414-1.414L12 10.586l2.793-2.793 1.414 1.414L13.414 12l2.793 2.793z"></path>
                </svg>
              </div>
              <div className="card-content">
                <h3>Rejected</h3>
                <span className="count">{rejectedOrders}</span>
              </div>
            </div>
          </div>
          
          <div className="chart-container">
            <div className="chart">
              <Pie data={chartData} />
            </div>
            <div className="chart-info">
              <h3>Order Distribution</h3>
              <p>Visual breakdown of all order statuses</p>
            </div>
          </div>
        </div>
      </>
    )}
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
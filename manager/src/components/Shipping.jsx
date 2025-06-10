import React, { useState, useEffect } from "react";
import "./shipping.css"; // Ensure this is included
import axios from "axios";
import { FaSearch } from "react-icons/fa";

const Shipping = () => {
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]); 

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/orders/shipped");
      if (!response.ok) throw new Error("Failed to fetch shipped orders");
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("❌ Error fetching shipped orders:", error);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearchQuery = order._id.toLowerCase().includes(searchQuery.toLowerCase());
    const orderDate = order.createdAt ? new Date(order.createdAt).toISOString().split("T")[0] : "";
    const matchesSearchDate = searchDate ? orderDate === searchDate : true;
    return matchesSearchQuery && matchesSearchDate;
  });

  const openPopup = (products = []) => {
    setSelectedProducts(products);
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setSelectedProducts([]);
  };

  return (
    <div className="container">
      <h1 className="title">Shipped Orders</h1>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search by Order ID"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-bar"
        />
        <input
          type="date"
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
          className="date-filter"
        />
      </div>

      {/* 🔄 Mobile card layout */}
      <div className="mobile-card-list">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <div key={order._id} className={`mobile-card delivered-card`}>
              <div className="card-header">
                <strong>Order ID:</strong> {order._id}
              </div>
              <div className="card-section">
                <strong>Name:</strong> {order.name || "N/A"}
              </div>
              <div className="card-section">
                <strong>Address:</strong><br />
                {order.billingAddress
                  ? `${order.billingAddress.address}, ${order.billingAddress.city}, ${order.billingAddress.state}, ${order.billingAddress.country} - ${order.billingAddress.zipCode}`
                  : "N/A"}
              </div>
              <div className="card-section">
                <strong>Phone:</strong> {order.phone || "N/A"}
              </div>
              <div className="card-section">
                <strong>Order Date:</strong> {order.createdAt ? new Date(order.createdAt).toLocaleString() : "N/A"}
              </div>
              <div className="card-section">
                <strong>Total Price:</strong> ₹{order.totalPrice || 0}
              </div>
              <div className="card-section">
                <strong>Status:</strong> <span className="status-badge">{order.status}</span>
              </div>
              <div className="card-section">
                <button className="item-count-btn" onClick={() => openPopup(order.items || [])}>
                  View {Array.isArray(order.items) ? order.items.length : "0"} Items
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-orders">No orders found.</div>
        )}
      </div>

      {/* 🔄 Desktop table layout */}
      <table className="order-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer Name</th>
            <th>Address</th>
            <th>Phone</th>
            <th>Order Date</th>
            <th>Total Price</th>
            <th>Items</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((order) => (
            <tr key={order._id}>
              <td>{order._id}</td>
              <td>{order.name || "N/A"}</td>
              <td>
                {order.billingAddress
                  ? `${order.billingAddress.address}, ${order.billingAddress.city}, ${order.billingAddress.state}, ${order.billingAddress.country} - ${order.billingAddress.zipCode}`
                  : "N/A"}
              </td>
              <td>{order.phone || "N/A"}</td>
              <td>{order.createdAt ? new Date(order.createdAt).toLocaleString() : "N/A"}</td>
              <td>₹{order.totalPrice || 0}</td>
              <td>
                <button className="item-count-btn" onClick={() => openPopup(order.items || [])}>
                  {Array.isArray(order.items) ? order.items.length : "0"}
                </button>
              </td>
              <td>
                <span className={`status-badge ${order.status.toLowerCase()}`}>
                  {order.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Popup */}
      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h2>Product Details</h2>
            <table className="product-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Product Name</th>
                  <th>Quantity</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {selectedProducts.length > 0 ? (
                  selectedProducts.map((product, index) => (
                    <tr key={index}>
                      <td><img src={product.mainImage} alt={product.productName} className="popup-product-image" /></td>
                      <td>{product.productName}</td>
                      <td>{product.quantity}</td>
                      <td>₹{product.price}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="4">No items found.</td></tr>
                )}
              </tbody>
            </table>
            <button className="close-btn" onClick={closePopup}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shipping;

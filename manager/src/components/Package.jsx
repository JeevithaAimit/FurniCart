import React, { useState, useEffect } from "react";
import "./Package.css";
import axios from "axios";

const Package = () => {
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [acceptedOrders, setAcceptedOrders] = useState([]);
  const [rejectedOrders, setRejectedOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);

  useEffect(() => {
    fetchOrders();
    fetchPayments();
    fetchAcceptedOrders();
    fetchRejectedOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/orders/packed");
      if (!response.ok) throw new Error("Failed to fetch packed orders");
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching packed orders:", error);
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/payments");
      if (!response.ok) throw new Error("Failed to fetch payments");
      const data = await response.json();
      setPayments(data);
    } catch (error) {
      console.error("Error fetching payments:", error);
    }
  };

  const fetchAcceptedOrders = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/accepted-orders");
      const data = await response.json();
      if (Array.isArray(data)) setAcceptedOrders(data);
    } catch (error) {
      console.error("Error fetching accepted orders:", error);
    }
  };

  const fetchRejectedOrders = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/rejected-orders");
      const data = await response.json();
      if (Array.isArray(data)) {
        const rejectedIds = data.map((order) => order.orderId);
        setRejectedOrders(rejectedIds);
      }
    } catch (error) {
      console.error("Error fetching rejected orders:", error);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearchQuery = order._id.toLowerCase().includes(searchQuery.toLowerCase());
    const orderDate = order.createdAt ? new Date(order.createdAt).toISOString().split("T")[0] : "";
    const matchesSearchDate = searchDate ? orderDate === searchDate : true;
    return matchesSearchQuery && matchesSearchDate && order.status === "Packed";
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
      <h1 className="title">Order List</h1>

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

      {/* TABLE VIEW */}
      <div className="table-view">
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
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
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
                    <button
                      className="item-count-btn"
                      onClick={() => openPopup(order.items || [])}
                    >
                      {Array.isArray(order.items) ? order.items.length : "0"}
                    </button>
                  </td>
                  <td>
                    <span className={`status-badge ${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8">No orders found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MOBILE CARD VIEW */}
      <div className="card-view">
        {filteredOrders.map((order) => (
          <div key={order._id} className="order-card">
            <h3>{order._id}</h3>
            <p><strong>Name:</strong> {order.name || "N/A"}</p>
            <p><strong>Address:</strong> {order.billingAddress
              ? `${order.billingAddress.address}, ${order.billingAddress.city}, ${order.billingAddress.state}, ${order.billingAddress.country} - ${order.billingAddress.zipCode}`
              : "N/A"}
            </p>
            <p><strong>Phone:</strong> {order.phone || "N/A"}</p>
            <p><strong>Date:</strong> {order.createdAt ? new Date(order.createdAt).toLocaleString() : "N/A"}</p>
            <p><strong>Total:</strong> ₹{order.totalPrice || 0}</p>
            <p>
              <strong>Items:</strong>{" "}
              <button className="item-count-btn" onClick={() => openPopup(order.items || [])}>
                {Array.isArray(order.items) ? order.items.length : "0"}
              </button>
            </p>
            <span className={`status-badge ${order.status.toLowerCase()}`}>
              {order.status}
            </span>
          </div>
        ))}
      </div>

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
                      <td>
                        <img
                          src={product.mainImage}
                          alt={product.productName}
                          className="popup-product-image"
                        />
                      </td>
                      <td>{product.productName}</td>
                      <td>{product.quantity}</td>
                      <td>₹{product.price}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4">No items found.</td>
                  </tr>
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

export default Package;

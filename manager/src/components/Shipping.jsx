import React, { useState, useEffect } from "react";
import "./shipping.css";
import { FaSearch } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

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
    document.body.style.overflow = 'hidden'; // Prevent scrolling when popup is open
  };

  const closePopup = () => {
    setShowPopup(false);
    setSelectedProducts([]);
    document.body.style.overflow = 'auto'; // Re-enable scrolling
  };

  return (
    <div className="shipping-container">
      <h1 className="shipping-title">Shipped Orders</h1>

      <div className="search-container">
        <div className="search-input-wrapper">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by Order ID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-bar"
          />
        </div>
        <input
          type="date"
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
          className="date-filter"
        />
      </div>

      {/* Mobile View */}
      <div className="mobile-view">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <div key={order._id} className="shipping-card">
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
                <strong>Status:</strong> <span className={`status-badge ${order.status.toLowerCase()}`}>{order.status}</span>
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

      {/* Desktop View */}
      <div className="desktop-view">
        <table className="shipping-table">
          <thead>
            <tr>
              <th>Order ID</th>
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
                  <td data-label="Order ID" style={{fontWeight:"bold"}}>{order._id} <br /><span style={{fontWeight:"normal"}}>{order.name}</span></td>
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
              ))
            ) : (
              <tr>
                <td colSpan="8">No orders found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Responsive Popup */}
      {showPopup && (
        <div className="popup-overlay" onClick={closePopup}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <h2>Product Details</h2>
              <button className="close-popup-btn" onClick={closePopup}>
                <IoClose size={24} />
              </button>
            </div>
            
            {/* Desktop Table View */}
            <div className="popup-table-desktop">
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
            </div>
            
            {/* Mobile Card View */}
            <div className="popup-cards-mobile">
              {selectedProducts.length > 0 ? (
                selectedProducts.map((product, index) => (
                  <div key={index} className="product-card">
                    <div className="product-image-container">
                      <img src={product.mainImage} alt={product.productName} className="mobile-product-image" />
                    </div>
                    <div className="product-details">
                      <h3>{product.productName}</h3>
                      <div className="product-meta">
                        <span><strong>Qty:</strong> {product.quantity}</span>
                        <span><strong>Price:</strong> ₹{product.price}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-items">No items found.</div>
              )}
            </div>
            
            <button className="close-btn-mobile" onClick={closePopup}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shipping;
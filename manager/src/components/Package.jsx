 import React, { useState, useEffect } from "react";
 import "./Package.css";
 import axios from "axios";
 import { faWeight } from "@fortawesome/free-solid-svg-icons";

 const Package = () => {
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [acceptedOrders, setAcceptedOrders] = useState([]);
  const [rejectedOrders, setRejectedOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;

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

  // Get current orders
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredOrders.length / ordersPerPage); i++) {
  pageNumbers.push(i);
  }

  return (
  <div className="package-container">
  <h1 className="package-title">Package List</h1>

  <div className="package-search-container">
  <input
  type="text"
  placeholder="Search by Order ID"
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  className="package-search-bar"
  />
  <input
  type="date"
  value={searchDate}
  onChange={(e) => setSearchDate(e.target.value)}
  className="package-date-filter"
  />
  </div>

  {/* TABLE VIEW - shown on larger screens */}
  <div className="package-table-view">
  <table className="package-order-table">
  <thead>
  <tr>

  <th>Order ID / Name</th>
  {/* <th>Customer Name</th> */}
  <th>Address</th>
  <th>Phone</th>
  <th>Order Date</th>
  <th>Total Price</th>
  <th>Items</th>
  <th>Status</th>
  </tr>
  </thead>
  <tbody>
  {currentOrders.length > 0 ? (
  currentOrders.map((order) => (
  <tr key={order._id}>
  <td data-label="Order ID" style={{fontWeight:"bold"}}>{order._id} <br /><span style={{fontWeight:"normal"}}>{order.name}</span></td>
  {/* <td data-label="Customer Name">{order.name || "N/A"}</td> */}
  <td data-label="Address">
  {order.billingAddress
  ? `${order.billingAddress.address}, ${order.billingAddress.city}, ${order.billingAddress.state}, ${order.billingAddress.country} - ${order.billingAddress.zipCode}`
  : "N/A"}
  </td>
  <td data-label="Phone">{order.phone || "N/A"}</td>
  <td data-label="Order Date">{order.createdAt ? new Date(order.createdAt).toLocaleString() : "N/A"}</td>
  <td data-label="Total Price">₹{order.totalPrice || 0}</td>
  <td data-label="Items">
  <button
  className="date-input"
  onClick={() => openPopup(order.items || [])}
  >
  {Array.isArray(order.items) ? order.items.length : "0"}
  </button>
  </td>
  <td data-label="Status">
  <span className={`package-status-badge ${order.status.toLowerCase()}`}>
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

  {/* MOBILE CARD VIEW - shown on smaller screens */}
  <div className="package-card-view">
  {currentOrders.length > 0 ? (
  currentOrders.map((order) => (
  <div key={order._id} className="package-order-card">
  <div className="package-card-header">
  <h3>Order ID: {order._id}</h3>
  <span className={`package-status-badge ${order.status.toLowerCase()}`}>
  {order.status}
  </span>
  </div>
  <div className="package-card-body">
  <p><strong>Name:</strong> {order.name || "N/A"}</p>
  <p><strong>Address:</strong> {order.billingAddress
  ? `${order.billingAddress.address}, ${order.billingAddress.city}`
  : "N/A"}
  </p>
  <p><strong>Phone:</strong> {order.phone || "N/A"}</p>
  <p><strong>Date:</strong> {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}</p>
  <div className="package-card-footer">
  <p><strong>Total:</strong> ₹{order.totalPrice || 0}</p>
  <button
  className="package-item-count-btn"
  onClick={() => openPopup(order.items || [])}
  >
  {Array.isArray(order.items) ? `${order.items.length} Items` : "0 Items"}
  </button>
  </div>
  </div>
  </div>
  ))
  ) : (
  <div className="package-no-orders">No orders found</div>
  )}
  </div>

  {/* Pagination */}
  <nav>
  <ul className="pagination">
  {pageNumbers.map(number => (
  <li key={number} className="page-item">
  <button onClick={() => paginate(number)} className={`page-link ${currentPage === number ? 'active' : ''}`}>
  {number}
  </button>
  </li>
  ))}
  </ul>
  </nav>

  {/* Popup */}
  {showPopup && (
  <div className="package-popup">
  <div className="package-popup-content">
  <h2>Product Details</h2>
  <div className="package-popup-table-container">
  <table className="package-product-table">
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
  <td data-label="Image">
  <img
  src={product.mainImage}
  alt={product.productName}
  className="package-popup-product-image"
  />
  </td>
  <td data-label="Product Name">{product.productName}</td>
  <td data-label="Quantity">{product.quantity}</td>
  <td data-label="Price">₹{product.price}</td>
  </tr>
  ))
  ) : (
  <tr>
  <td colSpan="4">No items found.</td>
  </tr>
  )}
  </tbody>
  </table>
  </div>

  <button className="package-close-btn" onClick={closePopup}>Close</button>
  </div>
  </div>
  )}
  </div>
  );
 };

 export default Package;
 
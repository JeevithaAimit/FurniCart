import React, { useState, useEffect } from "react";
import "./Package.css";
import axios from "axios";
import { FaSearch } from "react-icons/fa";

const Package = () => {
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [acceptedOrders, setAcceptedOrders] = useState([]);
  const [rejectedOrders, setRejectedOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const [selectedProducts, setSelectedProducts] = useState([]); // Stores products for popup


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
        console.log("📦 Orders Fetched:", data); 

        data.forEach((order, index) => {
            console.log(`🔹 Order ${index + 1}:`, order);
            console.log("🛒 Products in Order:", order.products || "No products found");
        });

        setOrders(data);
    } catch (error) {
        console.error("❌ Error fetching packed orders:", error);
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
      console.error("❌ Error fetching accepted orders:", error);
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
      console.error("❌ Error fetching rejected orders:", error);
    }
  };

  // const isPaid = (order) => {
  //   return payments.some((payment) => String(payment.orderId?._id) === String(order._id));
  // };

  const handleAccept = async (orderId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/accept-order/${orderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Failed to accept order.");

      setAcceptedOrders((prev) => [...prev, orderId]); // Update UI immediately
      alert("✅ Order Accepted!");
    } catch (error) {
      console.error("❌ Error accepting order:", error);
      alert("⚠️ Failed to accept order.");
    }
  };

  const handleReject = async (orderId) => {
    if (!orderId) return alert("⚠️ Invalid order ID. Please try again.");

    if (rejectedOrders.includes(orderId)) return alert("⚠️ Order already rejected!");

    const confirmReject = window.confirm("Are you sure you want to reject this order?");
    if (!confirmReject) return;

    try {
      const response = await fetch(`http://localhost:8000/api/reject-order/${orderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Failed to reject order.");

      setRejectedOrders((prev) => [...prev, orderId]);
      alert("❌ Order successfully rejected!");
    } catch (error) {
      console.error("❌ Error rejecting order:", error);
      alert("⚠️ Failed to reject order. Please try again.");
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearchQuery = order._id.toLowerCase().includes(searchQuery.toLowerCase());
    const orderDate = order.createdAt ? new Date(order.createdAt).toISOString().split("T")[0] : "";
    const matchesSearchDate = searchDate ? orderDate === searchDate : true;
    const matchesPackedStatus = order.status === "Packed"; // ✅ Filter only "Packed" orders


    return matchesSearchQuery && matchesSearchDate;
  });

  const openPopup = (products = []) => {
    console.log("Opening Popup with Products:", products); // Debugging
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
        {/* <FaSearch className="search-icon" /> */}
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

      <table className="order-table">
  <thead>
    <tr>
      <th>Order ID</th>
      <th>Customer Name</th>
      <th>Address</th>  {/* Changed Email to Address */}
      <th>Phone</th>
      <th>Order Date</th>
      <th>Total Price</th>
      <th>Items</th>
      <th>Status</th> 
    </tr>
  </thead>
  <tbody>
    {filteredOrders.length > 0 ? (
      filteredOrders.map((order) => {
        const isAccepted = acceptedOrders.includes(order._id);
        const isRejected = rejectedOrders.includes(order._id);

        return (
          <tr key={order._id}>
            <td>{order._id}</td>
            <td>{order.name || "N/A"}</td>
            <td>
              {order.billingAddress 
                ? `${order.billingAddress.address}, ${order.billingAddress.city}, ${order.billingAddress.state}, ${order.billingAddress.country} - ${order.billingAddress.zipCode}`
                : "N/A"
              }
            </td> {/* Updated to Address */}
            <td>{order.phone || "N/A"}</td>
            <td>{order.createdAt ? new Date(order.createdAt).toLocaleString() : "N/A"}</td>
            <td>₹{order.totalPrice || 0}</td>
            <td>
              <button 
                className="item-count-btn" 
                onClick={() => {
                  console.log("🛒 Order Items:", order.items || "No items found");
                  openPopup(order.items || []);
                }}
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
        );
      })
    ) : (
      <tr>
        <td colSpan="8">No orders found</td>
      </tr>
    )}
  </tbody>
</table>


       {/* Popup for displaying product details */}
      {/* Popup for displaying product details */}
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

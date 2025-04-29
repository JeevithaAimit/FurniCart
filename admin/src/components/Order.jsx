import React, { useEffect, useState } from "react";
import "./order.css"; // Add CSS for better styling

const OrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/orders") // Update with your actual API URL
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch orders");
        }
        return res.json();
      })
      .then((data) => {
        setOrders(data);
        setError(null);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching orders:", error);
        setError("Failed to load orders. Please try again.");
        setLoading(false);
      });
  }, []);

  return (
    <div className="order-container">
      <h2>Order Details</h2>
      
      {error && <p className="error">{error}</p>} {/* Display error if fetch fails */}
      {loading && <p className="loading">Loading orders...</p>} {/* Loading message */}
      
      {!loading && orders.length === 0 && <p className="no-orders">No orders found</p>} {/* Show when no orders */}
      
      <table className="order-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Product Name</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Total Price</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
  {orders.length === 0 ? (
    <tr>
      <td colSpan="8" className="no-orders">No orders found</td>
    </tr>
  ) : (
    orders.map((order) =>
      order.items.map((item, index) => (
        <tr key={order._id + index}>
          <td>{order.name}</td>
          <td>{order.email}</td>
          <td>{order.phone}</td>
          <td>{item.productName}</td>
          <td>{item.quantity}</td>
          <td>₹{item.price ?? "N/A"}</td> {/* ✅ Avoids undefined values */}
          <td>₹{(item.price && item.quantity) ? (item.price * item.quantity).toFixed(2) : "N/A"}</td>
          <td className={`status-${order.status.toLowerCase()}`}>{order.status}</td>
        </tr>
      ))
    )
  )}
</tbody>

      </table>
    </div>
  );
};

export default OrderPage;

import React, { useEffect, useState } from "react";
import "./order.css";
import { FaEye } from "react-icons/fa";

const OrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 8;

  useEffect(() => {
    fetch("http://localhost:5000/orders")
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

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setSelectedOrder(null);
  };

  // Pagination calculations
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  return (
    <div className="order-container">
      <h2>Order Details</h2>

      {error && <p className="error">{error}</p>}
      {loading && <p className="loading">Loading orders...</p>}
      {!loading && orders.length === 0 && <p className="no-orders">No orders found</p>}

      <table className="order-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Status</th>
            <th>View</th>
          </tr>
        </thead>
        <tbody>
          {currentOrders.map((order) => (
            <tr key={order._id}>
              <td>{order.name}</td>
              <td>{order.email}</td>
              <td>{order.phone}</td>
              <td className={`status-${order.status.toLowerCase()}`}>{order.status}</td>
              <td>
                <FaEye
                  className="view-icon"
                  onClick={() => handleViewDetails(order)}
                  title="View Order Details"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Buttons */}
      <div className="pagination">
      <button
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
      >
        Prev
      </button>

      {Array.from({ length: totalPages }, (_, index) => (
        <button
          key={index + 1}
          className={currentPage === index + 1 ? "active-page" : ""}
          onClick={() => setCurrentPage(index + 1)}
        >
          {index + 1}
        </button>
      ))}

  <button
    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
    disabled={currentPage === totalPages}
  >
    Next
  </button>
</div>


      {/* Popup for order details */}
      {showPopup && selectedOrder && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Order Items</h3>
            <table className="popup-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Product Name</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total Price</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.items.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <img
                        src={item.mainImage}
                        alt={item.productName}
                        className="product-image"
                      />
                    </td>
                    <td>{item.productName}</td>
                    <td>₹{item.price ?? "N/A"}</td>
                    <td>{item.quantity}</td>
                    <td>
                      ₹
                      {item.price && item.quantity
                        ? (item.price * item.quantity).toFixed(2)
                        : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="close-btn" onClick={closePopup}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderPage;

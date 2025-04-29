import React, { useEffect, useState } from "react";
import "./Package.css"; // ✅ Using the same CSS as Shipping
import { FaSearch } from "react-icons/fa";

const Deliver = () => {
  const [deliveredOrders, setDeliveredOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);

  useEffect(() => {
    fetchDeliveredOrders();
  }, []);

  const fetchDeliveredOrders = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/orders/delivered"); // Fetch "Delivered" orders
      if (!response.ok) throw new Error("Failed to fetch delivered orders");

      const data = await response.json();
      console.log("✅ Delivered Orders Fetched:", data);

      setDeliveredOrders(data);
    } catch (error) {
      console.error("❌ Error fetching delivered orders:", error);
    }
  };

  const filteredOrders = deliveredOrders.filter((order) => {
    const matchesSearchQuery = order._id.toLowerCase().includes(searchQuery.toLowerCase());
    const orderDate = order.deliveredAt ? new Date(order.deliveredAt).toISOString().split("T")[0] : "";
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
      <h1 className="title">Delivered Orders</h1>

      {/* ✅ Search & Date Filter */}
      <div className="search-container">
        <FaSearch className="search-icon" />
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

      {/* ✅ Orders Table */}
      <table className="order-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer Name</th>
            <th>Address</th>
            <th>Phone</th>
            <th>Delivered Date</th>
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
              <td colSpan="8">No delivered orders found</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ✅ Popup for displaying product details */}
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
            <button className="close-btn" onClick={closePopup}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Deliver;

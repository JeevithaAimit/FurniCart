import React, { useState, useEffect } from "react";
import axios from "axios";
import { Trash2 } from "lucide-react";
import "./customerDetails.css";

const CustomerDetails = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const customersPerPage = 10;

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    handleSearch(searchTerm);
  }, [customers, searchTerm]);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/customers");
      setCustomers(response.data);
    } catch (error) {
      console.error("❌ Error fetching customer data:", error);
      setError("Failed to load customer details. Please try again.");
    }
  };

  const fetchOrdersByCustomerId = async (customerId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/orders/by-customer/${customerId}`
      );
      setSelectedOrders(response.data);
      setShowOrderModal(true); // Show the modal when orders are fetched
    } catch (err) {
      console.error("❌ Failed to fetch order details", err);
    }
  };

  const handleDelete = async (customerId) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      try {
        await axios.delete(`http://localhost:5000/customers/${customerId}`);
        setCustomers((prev) => prev.filter((cust) => cust._id !== customerId));
      } catch (error) {
        console.error("❌ Error deleting customer:", error);
        setError("Failed to delete customer. Please try again.");
      }
    }
  };

  const handleSearch = (value) => {
    const lowerCaseValue = value.toLowerCase();
    const filtered = customers.filter((cust) =>
      cust.name.toLowerCase().includes(lowerCaseValue)
    );
    setFilteredCustomers(filtered);
    setCurrentPage(1); // Reset to the first page on search
  };

  // Pagination Logic
  const indexOfLast = currentPage * customersPerPage;
  const indexOfFirst = indexOfLast - customersPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);

  const changePage = (pageNumber) => setCurrentPage(pageNumber);

  // Function to determine the color for the status
  const getStatusColor = (status) => {
    switch (status) {
      case "Packed":
        return "purple";
      case "Placed":
        return "Blue";
      case "Shipped":
        return "gold";
      case "Rejected":
        return "red";
      case "Delivered":
        return "green";
      default:
        return "gray"; // Default color if status is not recognized
    }
  };

  return (
    <div className="customer-section">
      <h2>Customer Details</h2>
      {error && <p className="error-message">{error}</p>}

      <input
        type="text"
        placeholder="Search by name..."
        className="search-bar"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Modal for showing order details */}
      {showOrderModal && (
        <div className="order-modal">
          <div className="modal-content">
            <button onClick={() => setShowOrderModal(false)} className="close-btn">
              X
            </button>
            <h3>Order Details</h3>
            {selectedOrders.length > 0 ? (
              selectedOrders.map((order) => (
                <div key={order._id} className="order-box">
                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                      style={{ color: getStatusColor(order.status), fontWeight: "bold" }}
                    >
                      {order.status}
                    </span>
                  </p>
                  <p>
                    {/* <strong>Order Date:</strong> {new Date(order.date).toLocaleDateString()} */}
                  </p>
                  <p>
                    <strong>Items:</strong>
                  </p>
                  <ul>
                    {order.items.map((item, idx) => (
                      <li key={idx}>
                        <strong>Product:</strong> {item.productName} —{" "}  <br />
                        <strong>Product ID:</strong> {item.productId} —{" "}
                        {/* <strong>Price:</strong> ₹{item.price} × {item.quantity} */}
                      </li>
                    ))}
                  </ul>
                  <hr />
                </div>
              ))
            ) : (
              <p>No orders found.</p>
            )}
          </div>
        </div>
      )}

      <table className="customer-table">
        <thead>
          <tr>
            <th>Full Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Orders</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {currentCustomers.length > 0 ? (
            currentCustomers.map((customer) => (
              <tr key={customer._id}>
                <td>{customer.name}</td>
                <td>{customer.email}</td>
                <td>{customer.phone || "N/A"}</td>
                <td>
                  <button className="view-order"onClick={() => fetchOrdersByCustomerId(customer._id)}>
                    View Orders ({customer.orderCount || 0}) {/* Ensure orderCount is available */}
                  </button>
                </td>
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(customer._id)}
                  >
                    <Trash2 size={18} color="red" />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No customer data available</td>
            </tr>
          )}
        </tbody>
      </table>

       <div className="customer-card-container">
      {currentCustomers.length > 0 ? (
        currentCustomers.map((customer) => (
          <div key={customer._id} className="customer-card">
            <div className="customer-card-header">
              <div className="customer-name">{customer.name}</div>
              <div className="customer-actions">
                <button 
                  className="view-order" 
                  onClick={() => fetchOrdersByCustomerId(customer._id)}
                >
                  View Orders ({customer.orderCount || 0})
                </button>
                <button 
                  className="delete-btn" 
                  onClick={() => handleDelete(customer._id)}
                >
                  <Trash2 size={18} color="red" />
                </button>
              </div>
            </div>
            <div className="customer-details">
              <div className="detail-row">
                <div className="detail-label">Email:</div>
                <div className="detail-value">{customer.email}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Phone:</div>
                <div className="detail-value">{customer.phone || "N/A"}</div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="no-data">No customer data available</div>
      )}
    </div>


      {/* Pagination */}
      <div className="pagination">
        <button
          onClick={() => changePage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Prev
        </button>

        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            className={currentPage === index + 1 ? "active-page" : ""}
            onClick={() => changePage(index + 1)}
          >
            {index + 1}
          </button>
        ))}

        <button
          onClick={() => changePage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default CustomerDetails;

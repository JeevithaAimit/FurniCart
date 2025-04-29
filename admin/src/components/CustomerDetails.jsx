import React, { useState, useEffect } from "react";
import axios from "axios";
import { Trash2 } from "lucide-react";
import "./customerDetails.css";

const CustomerDetails = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

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
    setCurrentPage(1); // reset to first page on search
  };

  // Pagination Logic
  const indexOfLast = currentPage * customersPerPage;
  const indexOfFirst = indexOfLast - customersPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);

  const changePage = (pageNumber) => setCurrentPage(pageNumber);

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

      <table className="customer-table">
        <thead>
          <tr>
            <th>Full Name</th>
            <th>Email</th>
            <th>Phone</th>
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
              <td colSpan="4">No customer data available</td>
            </tr>
          )}
        </tbody>
      </table>

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

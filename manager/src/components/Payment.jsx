import React, { useEffect, useState } from "react";
import "./payment.css";

const Payment = () => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 8; // Display 8 records per page
  const [searchTerm, setSearchTerm] = useState("");
  // const [selectedDate, setSelectedDate] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/payments");
      if (!response.ok) throw new Error("Failed to fetch payments");
      const data = await response.json();
      console.log("🔹 Payment Data:", data); // Debug API Response

      // Filter out payments where orderId or essential details are missing
      const filteredPayments = data.filter((payment) => 
        payment.orderId &&
        payment.orderId._id !== "N/A" &&
        payment.orderId.name &&
        payment.orderId.name !== "N/A" &&
        payment.orderId.email &&
        payment.orderId.email !== "N/A" &&
        payment.paymentMethod &&
        payment.paymentMethod !== "N/A" &&
        payment.amount &&
        payment.amount !== "N/A"
      );

      setPayments(filteredPayments);
      setFilteredPayments(filteredPayments);
    } catch (error) {
      console.error("❌ Error fetching payments:", error);
      setPayments([]);
    }
  };

  // Filtering function
  const filterPayments = () => {
    let filtered = [...payments];

    if (searchTerm) {
      filtered = filtered.filter(
        (payment) =>
          payment.orderId?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.orderId?._id.includes(searchTerm)
      );
    }



    if (selectedPaymentMethod) {
      filtered = filtered.filter(
        (payment) => payment.paymentMethod === selectedPaymentMethod
      );
    }

    setFilteredPayments(filtered);
  };

  useEffect(() => {
    filterPayments();
  }, [searchTerm, selectedPaymentMethod]);

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredPayments.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredPayments.length / recordsPerPage);

  return (
    <div className="payment-container">
      <h1>Payment Details</h1>

      <div className="search-dropdown-container">
  {/* Search Bar */}
  <input
          type="text"
          placeholder="Search by Order ID or Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-bar"
        />

  {/* Dropdown for Payment Method Filter */}
  <div className="payment-method-filter">
    <label htmlFor="payment-method">Payment Method:</label>
    <select
      id="payment-method"
      value={selectedPaymentMethod}
      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
    >
      <option value="">All Payment Methods</option>
      <option value="Credit Card">Credit Card</option>
      <option value="UPI">UPI</option>
      <option value="Cash on Delivery">Cash on Delivery</option>
    </select>
  </div>
</div>


      <table className="payment-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Payment Method</th>
            <th>Amount</th>
            <th>Payment Details</th>
          </tr>
        </thead>
        <tbody>
          {currentRecords.length > 0 ? (
            currentRecords.map((payment) => (
              <tr key={payment._id}>
                <td><strong>{payment.orderId?._id}</strong></td>
                <td>{payment.orderId?.name}</td>
                <td>{payment.orderId?.email}</td>
                <td>{payment.paymentMethod}</td>
                <td>₹{payment.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                <td className="payment-details">
                  {payment.paymentMethod === "Credit Card" && payment.cardDetails ? (
                    <>
                      <strong>Card Holder:</strong> {payment.cardDetails.cardHolder} <br />
                      <strong>Card Number:</strong> 
                      {payment.cardDetails.cardNumber 
                        ? `**** **** **** ${payment.cardDetails.cardNumber.slice(-4)}` 
                        : "N/A"} <br />
                      <strong>Expiry:</strong> {payment.cardDetails.expiryDate}
                    </>
                  ) : payment.paymentMethod === "UPI" && payment.upiDetails ? (
                    <>
                      <strong>Provider:</strong> {payment.upiDetails.provider} <br />
                      <strong>UPI ID:</strong> {payment.upiDetails.upiId}
                    </>
                  ) : (
                    "N/A"
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="no-data">No valid payments found</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="pagination">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="nav-button"
        >
          Prev
        </button>

        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            onClick={() => setCurrentPage(index + 1)}
            className={currentPage === index + 1 ? "active-page" : ""}
          >
            {index + 1}
          </button>
        ))}

        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="nav-button"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Payment;

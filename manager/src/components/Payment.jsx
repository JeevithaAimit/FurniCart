import React, { useEffect, useState } from "react";
import "./payment.css";

const Payment = () => {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/payments");
      if (!response.ok) throw new Error("Failed to fetch payments");
      const data = await response.json();
      console.log("🔹 Payment Data:", data); // ✅ Debug API Response

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
    } catch (error) {
      console.error("❌ Error fetching payments:", error);
      setPayments([]);
    }
  };

  return (
    <div className="payment-container">
      <h1>Payment Details</h1>
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
          {payments.length > 0 ? (
            payments.map((payment) => (
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
    </div>
  );
};

export default Payment;

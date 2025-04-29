import React, { useState } from "react";
import axios from "axios";
import "./tracking.css";

const ProductTracking = () => {
  const [orderId, setOrderId] = useState("");
  const [status, setStatus] = useState(null);
  const [items, setItems] = useState([]); // Store item details
  const [error, setError] = useState("");
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [complaint, setComplaint] = useState("");
  // const [image, setImage] = useState(null);

  const handleTrack = async () => {
    try {
      console.log(`Fetching order status for: ${orderId}`);
      const response = await axios.get(`http://localhost:8500/api/track/${orderId}`);
  
      console.log("API Response:", response.data);
  
      if (response.data) {
        setStatus(response.data.status);
        setItems(response.data.items || []); // ✅ Store items in state
        setError("");
        if (response.data.status === "Delivered") {
          setShowFeedback(true);
        } else {
          setShowFeedback(false);
      } 
      }else {
        setStatus(null);
        setItems([]);
        setError("No order details found.");
      }
    } catch (err) {
      console.error("Error fetching order:", err);
      setStatus(null);
      setItems([]);
      setError("Order not found. Please check the Order ID.");
    }
  };
  const handleFeedbackSubmit = async () => {
    console.log("Submitting feedback:", { orderId, rating, feedback, complaint });

    try {
        const response = await axios.post("http://localhost:8500/api/feedback", {
            orderId,
            rating,
            feedback,
            complaint,
        }, {
            headers: { "Content-Type": "application/json" }, // ✅ Use JSON
        });

        console.log("✅ Feedback Response:", response.data);
        alert("Feedback submitted successfully!");

        // Reset form after submission
        setShowFeedback(false);
        setRating(0);
        setFeedback("");
        setComplaint(""); // ✅ Reset complaint

    } catch (error) {
        console.error("❌ Error submitting feedback:", error.response?.data || error.message);
        alert(error.response?.data?.message || "Failed to submit feedback. Try again.");
    }
};

  
const getProgressWidth = () => {
  switch (status) {
    case "Rejected":
      return "10%";
    case "Placed":
      return "25%";
    case "Packed":
      return "50%";
    case "Shipped":
      return "75%";
    case "Delivered":
      return "100%";
    default:
      return "0%";
  }
};


  return (
    <div className="tracking-container">
      <div className="truck-container">
        <img
          src="https://cdn-icons-png.flaticon.com/128/713/713311.png"
          alt="Truck"
          className="truck"
        />
      </div>
      <h2>Track Your Order</h2>
      <input
        type="text"
        placeholder="Enter Order ID"
        value={orderId}
        onChange={(e) => setOrderId(e.target.value)}
      />
      <button onClick={handleTrack}>Track</button>

      {status && <h3>Status: {status}</h3>}
      {error && <h3 style={{ color: "red" }}>{error}</h3>}

      {/* Progress Bar */}
    {/* Progress Bar */}
<div className="tracking-bar-container">
  <div className="tracking-bar">
    <div className="progress" style={{ width: getProgressWidth() }}></div>
  </div>
  <div className="tracking-status">
    <span className={status === "Rejected" ? "active rejected" : ""}>Rejected</span>
    <span className={["Placed", "Packed", "Shipped", "Delivered"].includes(status) ? "active" : ""}>Placed</span>
    <span className={["Packed", "Shipped", "Delivered"].includes(status) ? "active" : ""}>Packed</span>
    <span className={["Shipped", "Delivered"].includes(status) ? "active" : ""}>Shipped</span>
    <span className={status === "Delivered" ? "active" : ""}>Delivered</span>
  </div>
</div>


      {/* Display Item Details */}
      {items.length > 0 && (
        <div className="order-items-container">
          {items.map((item, index) => (
            <div key={index} className="order-item-card">
             <img 
 src={item.mainImage || "https://via.placeholder.com/100"} 

  alt={item.name} 
  className="order-item-image" 
  onError={(e) => e.target.src = "/images/fallback.png"} 
/>

              <div className="order-item-details">
                <h4>{item.productName}</h4>
                <p>Qty: {item.quantity}</p>
                <p className="order-item-price">₹{item.price}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      
    {/* Feedback Popup */}
    {showFeedback && (
        <div className="feedback-popup-overlay">
          <div className="feedback-popup">
            <span className="close-btn" onClick={() => setShowFeedback(false)}>×</span>
            <h3>Rate Your Experience</h3>
            <div className="rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={rating >= star ? "star filled" : "star"}
                  onClick={() => setRating(star)}
                >
                  ★
                </span>
              ))}
            </div>
            <textarea
              placeholder="Leave your feedback..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
            <select value={complaint} onChange={(e) => setComplaint(e.target.value)}>
              <option value="">Select Complaint</option>
              <option value="Damaged Product">Damaged Product</option>
              <option value="Late Delivery">Late Delivery</option>
              <option value="Wrong Item Received">Wrong Item Received</option>
              <option value="Poor Packaging">Poor Packaging</option>
              <option value="Other">Other</option>
            </select>
            <button onClick={handleFeedbackSubmit}>Submit Feedback</button>
          </div>
        </div>
      )}
   
    </div>
  );
};

export default ProductTracking;

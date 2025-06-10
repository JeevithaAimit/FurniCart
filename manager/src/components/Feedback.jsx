import React, { useState, useEffect } from "react";
import axios from "axios";
import "./feedback.css";

const FeedbackList = () => {
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/feedbacks");
        console.log("✅ Feedbacks:", response.data);
        setFeedbacks(response.data);
      } catch (error) {
        console.log(
          "❌ Error fetching feedbacks:",
          error.response?.data || error.message
        );
      }
    };

    fetchFeedbacks();
  }, []);

  return (
    <div className="feedback-list-container">
      <h2>Customer Feedback</h2>

      {/* TABLE VIEW */}
      {feedbacks.length > 0 ? (
        <div className="table-view">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Email</th>
                <th>Feedback</th>
                <th>Complaint</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              {feedbacks.map((fb, index) => (
                <tr key={index}>
                  <td>{fb.orderId}</td>
                  <td>{fb.email}</td>
                  <td>{fb.feedback}</td>
                  <td>{fb.complaint || "No complaint"}</td>
                  <td>{fb.rating || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No feedback available.</p>
      )}

      {/* CARD VIEW */}
      <div className="card-view">
        {feedbacks.map((fb, index) => (
          <div key={index} className="feedback-card">
            <h3>{fb.orderId}</h3>
            <p><strong>Email:</strong> {fb.email}</p>
            <p><strong>Feedback:</strong> {fb.feedback}</p>
            <p><strong>Complaint:</strong> {fb.complaint || "No complaint"}</p>
            <p><strong>Rating:</strong> {fb.rating || "N/A"}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeedbackList;

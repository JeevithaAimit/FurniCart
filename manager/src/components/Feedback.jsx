import React, { useState, useEffect } from "react";
import axios from "axios";
import "./feedback.css";


const FeedbackList = () => {
    const [feedbacks, setFeedbacks] = useState([]);

    useEffect(() => {
        const fetchFeedbacks = async () => {
          try {
            const response = await axios.get('http://localhost:8000/api/feedbacks');
            console.log("✅ Feedbacks:", response.data);
            setFeedbacks(response.data); // ← Add this line
          } catch (error) {
            console.log("❌ Error fetching feedbacks:", error.response?.data || error.message);
          }
        };
      
        fetchFeedbacks();
      }, []);
      
      
    

    return (
        <div className="feedback-list-container">
            <h2>Customer Feedback</h2>
            {feedbacks.length > 0 ? (
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
            ) : (
                <p>No feedback available.</p>
            )}
        </div>
    );
};

export default FeedbackList;

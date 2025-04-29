import React, { useEffect, useState } from "react";
import axios from "axios";
import './order.css'; // Style the table

const OrderDetails = () => {
  const [orders, setOrders] = useState([]); // State to hold fetched orders
  const [loading, setLoading] = useState(true); // Loading state for the data
  const [error, setError] = useState(null); // Error state to capture any errors

  // Fetch order details from the backend API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/orders"); // Replace with correct backend URL
        setOrders(response.data); // Update state with the fetched orders
        setLoading(false); // Set loading to false once data is fetched
      } catch (error) {
        setError("Error fetching orders");
        setLoading(false);
      }
    };

    fetchOrders(); // Call the function to fetch orders
  }, []); // Empty dependency array to call once when the component mounts

  // Render loading state, error state, or the data itself
  if (loading) {
    return <div>Loading orders...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }


  return (
    <div className="order-details-container">
      <h1>Order Details</h1>
      <table className="order-details-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer Name</th>
            <th>Email</th>
            <th>Phone</th>
            {/* <th>Address</th> */}
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id}>
              <td>{order._id}</td>
              <td>{order.name}</td>
              <td>{order.email}</td>
              <td>{order.phone}</td>
             
    
              {/* <td>{order.totalPrice}</td> */}
              <td className={
                    order.status === "Placed"
                      ? "status-placed"
                      : order.status === "Shipped"
                      ? "status-shipped"
                      : order.status === "Delivered"
                      ? "status-delivered"
                      : "status-other"
                  }>
                  {order.status}
                </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderDetails;

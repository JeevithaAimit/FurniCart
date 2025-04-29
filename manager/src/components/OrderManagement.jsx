import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEye, FaEllipsisV } from "react-icons/fa";
import "./orderMangement.css";

const Package = () => {
    const [orders, setOrders] = useState([]);
    const [payments, setPayments] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchDate, setSearchDate] = useState("");
    const [selectedOrder, setSelectedOrder] = useState(null); // For status change popup
    const [viewOrder, setViewOrder] = useState(null); // For viewing details
    const [currentPage, setCurrentPage] = useState(1); // For pagination
    const [ordersPerPage] = useState(10); // Show 10 records per page

    useEffect(() => {
        fetchOrders();
        fetchPayments();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await axios.get("http://localhost:8000/api/orders");
            setOrders(response.data);
        } catch (error) {
            console.error("❌ Error fetching orders:", error);
        }
    };

    const fetchPayments = async () => {
        try {
            const response = await axios.get("http://localhost:8000/api/payments");
            setPayments(response.data);
        } catch (error) {
            console.error("❌ Error fetching payments:", error);
        }
    };

    const isPaid = (order) => {
        return payments.some((payment) => String(payment.orderId?._id) === String(order._id));
    };

    const openPopup = (order) => setSelectedOrder(order);
    const closePopup = () => setSelectedOrder(null);

    const openViewPopup = (order) => setViewOrder(order);
    const closeViewPopup = () => setViewOrder(null);

    const filteredOrders = orders.filter((order) => {
        const orderIdMatch = order._id.toLowerCase().includes(searchQuery.toLowerCase());
        const orderDate = order.createdAt ? new Date(order.createdAt).toISOString().split("T")[0] : "";
        const orderDateMatch = searchDate ? orderDate === searchDate : true;
        return orderIdMatch && orderDateMatch;
    });

    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

    const handleStatusChange = async (newStatus) => {
        if (!selectedOrder) return;

        try {
            const response = await axios.put(
                `http://localhost:8000/api/orders/${selectedOrder._id}/status`,
                { status: newStatus },
                { headers: { "Content-Type": "application/json" } }
            );

            if (response.status === 200) {
                console.log("✅ Order status updated:", newStatus);

                // Update UI Immediately
                setOrders((prevOrders) =>
                    prevOrders.map((order) =>
                        order._id === selectedOrder._id ? { ...order, status: newStatus } : order
                    )
                );

                closePopup();
            } else {
                console.error("❌ Failed to update status");
            }
        } catch (error) {
            console.error("❌ Error updating status:", error.response?.data || error.message);
        }
    };

    const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ordersPerPage));
    const pageNumbers = [];

    const pageSetSize = 4;
    const currentSet = Math.floor((currentPage - 1) / pageSetSize);
    const startPage = currentSet * pageSetSize + 1;
    const endPage = Math.min(startPage + pageSetSize - 1, totalPages);
    
    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
    }
    return (
        <div className="container">
            <h1 className="title">Order List</h1>

            {/* Search Filters */}
            <div className="search-container">
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

            {/* Orders Table */}
            <table className="orders-table">
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Customer Name</th>
                        <th>Order Date</th>
                        <th>Email</th>
                        <th>Phone No</th>
                        <th>Payment Status</th>
                        <th>View</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredOrders.length > 0 ? (
                        currentOrders.map((order) => (
                            <tr key={order._id}>
                                <td>{order._id}</td>
                                <td>{order.name || "N/A"}</td>
                                <td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}</td>
                                <td>{order.email || "N/A"}</td>
                                <td>{order.phone || "N/A"}</td>
                                <td className={`payment-status ${isPaid(order) ? "paid" : "unpaid"}`}>
                                    {isPaid(order) ? "✅ Paid" : "❌ Unpaid"}
                                </td>
                                <td>
                                    <FaEye
                                        style={{ cursor: "pointer", color: "blue" }}
                                        onClick={() => openViewPopup(order)}
                                    />
                                </td>
                                <td>
                                    <span className={`status-badge ${order.status?.toLowerCase() || "pending"}`}>
                                        {order.status || "Pending"}
                                    </span>
                                </td>
                                <td>
                                    <FaEllipsisV className="menu-icon" onClick={() => openPopup(order)} />
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="8">No orders found</td>
                        </tr>
                    )}
                </tbody>
            </table>
            <div className="pagination">
    <button
        onClick={() => setCurrentPage(currentPage - 1)}
        disabled={currentPage === 1}
        className="page-button"
    >
        Prev
    </button>

    {startPage > 1 && (
        <span className="page-dots">...</span>
    )}

    {pageNumbers.map((pageNum) => (
        <button
            key={pageNum}
            onClick={() => setCurrentPage(pageNum)}
            className={`page-button ${currentPage === pageNum ? "active" : ""}`}
        >
            {pageNum}
        </button>
    ))}

    {endPage < totalPages && (
        <span className="page-dots">...</span>
    )}

    <button
        onClick={() => setCurrentPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="page-button"
    >
        Next
    </button>
</div>

            {/* Order Details Popup */}
            {viewOrder && (
                <div className="popup-overlay">
                    <div className="popup-box view-popup">
                        <h2>Order Details</h2>
                        <p><strong>Order ID:</strong> {viewOrder._id}</p>
                        <p><strong>Order Date:</strong> {new Date(viewOrder.createdAt).toLocaleString()}</p><br />

                        <p><strong>Customer Name:</strong> {viewOrder.name}</p>
                        <p><strong>Email:</strong> {viewOrder.email}</p>
                        <p><strong>Phone:</strong> {viewOrder.phone}</p><br />

                        {/* ✅ Fixed Shipping Address Section */}
                        {viewOrder?.shippingAddress ? (
                            <div className="shipping-address">
                                <h3>Shipping Address</h3>
                                <p>{viewOrder.shippingAddress?.address || "N/A"}, {viewOrder.shippingAddress?.city || "N/A"},</p>
                                <p>{viewOrder.shippingAddress?.state || "N/A"}, {viewOrder.shippingAddress?.country || "N/A"} - {viewOrder.shippingAddress?.zipCode || "N/A"}</p>
                            </div>
                        ) : (
                            <p><strong>Shipping Address:</strong> Not Available</p>
                        )}
                        <br />

                        {viewOrder?.billingAddress ? (
                            <div className="shipping-address">
                                <h3>Billing Address</h3>
                                <p>{viewOrder.billingAddress.address}, {viewOrder.billingAddress.city},</p>
                                <p>{viewOrder.billingAddress.state}, {viewOrder.billingAddress.country} - {viewOrder.billingAddress.zipCode}</p>
                            </div>
                        ) : <p><strong>Billing Address:</strong> Not Available</p>}

                        <br />

                        {/* ✅ Fixed Items Section (Now displays correct images) */}
                        <div className="items-section">
                            <h3>Items</h3>
                            <div className="items-container">
                                {viewOrder.items.map((item, index) => (   
                                    <div key={index} className="item-card">
                                        <img src={item.mainImage} alt={item.productName} height="80" />
                                        <p><strong>{item.productName}</strong></p>
                                        <p>Qty: {item.quantity}</p>
                                        <p>₹{item.price}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Total Price */}
                        <p className="total-price"><strong>Total Price:</strong> ₹{viewOrder.totalPrice}</p>

                        <button className="close-btn" onClick={closeViewPopup}>Close</button>
                    </div>
                </div>
            )}
        
            {/* Order Status Update Popup */}
            {selectedOrder && (
                <div className="popup-overlay">
                    <div className="popup-boxButton">
                        <button className="close-btn" onClick={closePopup}>&times;</button>
                        <h2>Update Order Status</h2>
                        <p><strong>Order ID:</strong> {selectedOrder._id}</p>
                        <div className="popup-buttons">
                            <button 
                                onClick={() => handleStatusChange("Rejected")} 
                                disabled={["Rejected", "Packed", "Shipped", "Delivered"].includes(selectedOrder.status)}
                            >
                                Rejected
                            </button>
                            <button 
                                onClick={() => handleStatusChange("Packed")} 
                                disabled={["Packed", "Shipped", "Delivered"].includes(selectedOrder.status)}
                            >
                                Packed
                            </button>
                            <button 
                                onClick={() => handleStatusChange("Shipped")} 
                                disabled={["Shipped", "Delivered"].includes(selectedOrder.status)}
                            >
                                Shipped
                            </button>
                            <button 
                                onClick={() => handleStatusChange("Delivered")} 
                                disabled={selectedOrder.status === "Delivered"}
                            >
                                Delivered
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Package;

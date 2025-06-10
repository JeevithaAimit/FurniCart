import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEye, FaEllipsisV, FaTimes, FaCheck, FaBox, FaTruck, FaHome, FaAngleLeft, FaAngleRight, FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";
import "./orderMangement.css";

const Package = () => {
    const [orders, setOrders] = useState([]);
    const [payments, setPayments] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchDate, setSearchDate] = useState("");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [viewOrder, setViewOrder] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 10;

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

    // Pagination logic
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

    const handleStatusChange = async (newStatus) => {
        if (!selectedOrder) return;
    
        try {
            const response = await axios.put(
                `http://localhost:8000/api/orders/${selectedOrder._id}/status`,
                { status: newStatus },
                { headers: { "Content-Type": "application/json" } }
            );
    
            if (response.status === 200) {
                setOrders((prevOrders) =>
                    prevOrders.map((order) =>
                        order._id === selectedOrder._id ? { ...order, status: newStatus } : order
                    )
                );
                closePopup();
            }
        } catch (error) {
            console.error("❌ Error updating status:", error.response?.data || error.message);
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const getStatusIcon = (status) => {
        switch(status?.toLowerCase()) {
            case 'delivered': return <FaCheck className="status-icon" />;
            case 'shipped': return <FaTruck className="status-icon" />;
            case 'packed': return <FaBox className="status-icon" />;
            case 'rejected': return <FaTimes className="status-icon" />;
            default: return <FaHome className="status-icon" />;
        }
    };

    const goToPage = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const renderPagination = () => {
        const pageNumbers = [];
        const maxPageButtons = 5; // Maximum number of page buttons to show
        
        let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);
        
        if (endPage - startPage + 1 < maxPageButtons) {
            startPage = Math.max(1, endPage - maxPageButtons + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        return (
            <div className="pagination-container">
                <button 
                    onClick={() => goToPage(1)} 
                    disabled={currentPage === 1}
                    className="pagination-button"
                >
                    <FaAngleDoubleLeft />
                </button>
                <button 
                    onClick={() => goToPage(currentPage - 1)} 
                    disabled={currentPage === 1}
                    className="pagination-button"
                >
                    <FaAngleLeft />
                </button>
                
                {startPage > 1 && (
                    <>
                        <button 
                            onClick={() => goToPage(1)} 
                            className={`pagination-button ${1 === currentPage ? 'active' : ''}`}
                        >
                            1
                        </button>
                        {startPage > 2 && <span className="pagination-ellipsis">...</span>}
                    </>
                )}
                
                {pageNumbers.map(number => (
                    <button
                        key={number}
                        onClick={() => goToPage(number)}
                        className={`pagination-button ${number === currentPage ? 'active' : ''}`}
                    >
                        {number}
                    </button>
                ))}
                
                {endPage < totalPages && (
                    <>
                        {endPage < totalPages - 1 && <span className="pagination-ellipsis">...</span>}
                        <button 
                            onClick={() => goToPage(totalPages)} 
                            className={`pagination-button ${totalPages === currentPage ? 'active' : ''}`}
                        >
                            {totalPages}
                        </button>
                    </>
                )}
                
                <button 
                    onClick={() => goToPage(currentPage + 1)} 
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="pagination-button"
                >
                    <FaAngleRight />
                </button>
                <button 
                    onClick={() => goToPage(totalPages)} 
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="pagination-button"
                >
                    <FaAngleDoubleRight />
                </button>
            </div>
        );
    };

    return (
        <div className="order-management-container">
            <div className="order-header">
                <h1 className="order-title">Order Management</h1>
                <div className="search-container">
                    <div className="search-group">
                        <input
                            type="text"
                            placeholder="Search orders..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                        <span className="search-icon">🔍</span>
                    </div>
                    <input
                        type="date"
                        value={searchDate}
                        onChange={(e) => setSearchDate(e.target.value)}
                        className="date-input"
                    />
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="desktop-view">
                <table className="orders-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Payment</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentOrders.length > 0 ? (
                            currentOrders.map((order) => (
                                <tr key={order._id}>
                                    <td className="order-id">{order._id}</td>
                                    <td>
                                        <div className="customer-info">
                                            <p className="customer-name">{order.name || "N/A"}</p>
                                            <p className="customer-email">{order.email || "N/A"}</p>
                                        </div>
                                    </td>
                                    <td>{formatDate(order.createdAt)}</td>
                                    <td className="order-amount">₹{order.totalPrice}</td>
                                    <td>
                                        <span className={`payment-badge ${isPaid(order) ? "paid" : "unpaid"}`}>
                                            {isPaid(order) ? "Paid" : "Unpaid"}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={`status-badge ${order.status?.toLowerCase() || "pending"}`}>
                                            {getStatusIcon(order.status)}
                                            <span>{order.status || "Pending"}</span>
                                        </div>
                                    </td>
                                    <td className="actions">
                                        <button className="view-btn" onClick={() => openViewPopup(order)}>
                                            <FaEye />
                                        </button>
                                        <button className="menu-btn" onClick={() => openPopup(order)}>
                                            <FaEllipsisV />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="no-orders">No orders found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
                {renderPagination()}
            </div>

            {/* Mobile Card View */}
            <div className="mobile-view">
                {currentOrders.length > 0 ? (
                    currentOrders.map((order) => (
                        <div key={order._id} className="order-card">
                            <div className="card-header">
                                <span className="order-id">#{order._id.slice(-8)}</span>
                                <span className={`payment-badge ${isPaid(order) ? "paid" : "unpaid"}`}>
                                    {isPaid(order) ? "Paid" : "Unpaid"}
                                </span>
                            </div>
                            <div className="card-body">
                                <div className="customer-info">
                                    <p className="customer-name">{order.name || "N/A"}</p>
                                    <p className="customer-email">{order.email || "N/A"}</p>
                                </div>
                                <div className="order-details">
                                    <div className="detail-item">
                                        <span className="detail-label">Date:</span>
                                        <span>{formatDate(order.createdAt)}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Amount:</span>
                                        <span className="order-amount">₹{order.totalPrice}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Status:</span>
                                        <div className={`status-badge ${order.status?.toLowerCase() || "pending"}`}>
                                            {getStatusIcon(order.status)}
                                            <span>{order.status || "Pending"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="card-footer">
                                <button className="view-btn" onClick={() => openViewPopup(order)}>
                                    <FaEye /> View Details
                                </button>
                                <button className="menu-btn" onClick={() => openPopup(order)}>
                                    <FaEllipsisV /> Actions
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-orders">No orders found</div>
                )}
                {renderPagination()}
            </div>

            {/* Order Details Popup */}
            {viewOrder && (
                <div className="popup-overlay">
                    <div className="popup-container">
                        <div className="popup-header">
                            <h2>Order Details</h2>
                            <button className="close-btn" onClick={closeViewPopup}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="popup-content">
                            <div className="order-summary">
                                <div className="summary-item">
                                    <span className="summary-label">Order ID:</span>
                                    <span className="summary-value">#{viewOrder._id.slice(-8)}</span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-label">Order Date:</span>
                                    <span className="summary-value">{formatDate(viewOrder.createdAt)}</span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-label">Status:</span>
                                    <div className={`status-badge ${viewOrder.status?.toLowerCase() || "pending"}`}>
                                        {getStatusIcon(viewOrder.status)}
                                        <span>{viewOrder.status || "Pending"}</span>
                                    </div>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-label">Payment:</span>
                                    <span className={`payment-badge ${isPaid(viewOrder) ? "paid" : "unpaid"}`}>
                                        {isPaid(viewOrder) ? "Paid" : "Unpaid"}
                                    </span>
                                </div>
                            </div>

                            <div className="customer-section">
                                <h3>Customer Information</h3>
                                <div className="customer-details">
                                    <div className="detail-item">
                                        <span className="detail-label">Name:</span>
                                        <span>{viewOrder.name || "N/A"}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Email:</span>
                                        <span>{viewOrder.email || "N/A"}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Phone:</span>
                                        <span>{viewOrder.phone || "N/A"}</span>
                                    </div>
                                </div>
                            </div>

                            {viewOrder?.shippingAddress && (
                                <div className="address-section">
                                    <h3>Shipping Address</h3>
                                    <div className="address-details">
                                        <p>{viewOrder.shippingAddress.address}, {viewOrder.shippingAddress.city}</p>
                                        <p>{viewOrder.shippingAddress.state}, {viewOrder.shippingAddress.country} - {viewOrder.shippingAddress.zipCode}</p>
                                    </div>
                                </div>
                            )}

                            {viewOrder?.billingAddress && (
                                <div className="address-section">
                                    <h3>Billing Address</h3>
                                    <div className="address-details">
                                        <p>{viewOrder.billingAddress.address}, {viewOrder.billingAddress.city}</p>
                                        <p>{viewOrder.billingAddress.state}, {viewOrder.billingAddress.country} - {viewOrder.billingAddress.zipCode}</p>
                                    </div>
                                </div>
                            )}

                            <div className="items-section">
                                <h3>Order Items ({viewOrder.items.length})</h3>
                                <div className="items-grid">
                                    {viewOrder.items.map((item, index) => (
                                        <div key={index} className="item-card">
                                            <img src={item.mainImage} alt={item.name} className="product-image" />
                                            <div className="item-details">
                                                <h4>{item.productName}</h4>
                                                <p>Quantity: {item.quantity}</p>
                                                <p className="item-price">₹{item.price}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="order-total">
                                <div className="total-item">
                                    <span>Subtotal:</span>
                                    <span>₹{viewOrder.totalPrice}</span>
                                </div>
                                <div className="total-item">
                                    <span>Shipping:</span>
                                    <span>₹0</span>
                                </div>
                                <div className="total-item grand-total">
                                    <span>Total:</span>
                                    <span>₹{viewOrder.totalPrice}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        
            {/* Status Change Popup */}
            {selectedOrder && (
                <div className="popup-overlay">
                    <div className="status-popup">
                        <div className="popup-header">
                            <h2>Update Order Status</h2>
                            <button className="close-btn" onClick={closePopup}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="popup-content">
                            <p className="order-reference">Order: #{selectedOrder._id.slice(-8)}</p>
                            <p className="current-status">
                                Current Status: 
                                <span className={`status-badge ${selectedOrder.status?.toLowerCase() || "pending"}`}>
                                    {getStatusIcon(selectedOrder.status)}
                                    <span>{selectedOrder.status || "Pending"}</span>
                                </span>
                            </p>
                            
                            <div className="status-options">
                                <button 
                                    className={`status-btn rejected ${selectedOrder.status === "Rejected" ? "active" : ""}`}
                                    onClick={() => handleStatusChange("Rejected")} 
                                    disabled={["Rejected", "Packed", "Shipped", "Delivered"].includes(selectedOrder.status)}
                                >
                                    <FaTimes /> Reject Order
                                </button>
                                <button 
                                    className={`status-btn packed ${selectedOrder.status === "Packed" ? "active" : ""}`}
                                    onClick={() => handleStatusChange("Packed")} 
                                    disabled={["Packed", "Shipped", "Delivered"].includes(selectedOrder.status)}
                                >
                                    <FaBox /> Mark as Packed
                                </button>
                                <button 
                                    className={`status-btn shipped ${selectedOrder.status === "Shipped" ? "active" : ""}`}
                                    onClick={() => handleStatusChange("Shipped")} 
                                    disabled={["Shipped", "Delivered"].includes(selectedOrder.status)}
                                >
                                    <FaTruck /> Mark as Shipped
                                </button>
                                <button 
                                    className={`status-btn delivered ${selectedOrder.status === "Delivered" ? "active" : ""}`}
                                    onClick={() => handleStatusChange("Delivered")} 
                                    disabled={selectedOrder.status === "Delivered"}
                                >
                                    <FaCheck /> Mark as Delivered
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Package;
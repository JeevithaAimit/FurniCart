import React, { useEffect, useState } from "react";
import axios from "axios";
import "./account.css"; 
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";

const AccountPage = () => {
    const [orderSummary, setOrderSummary] = useState({
        totalOrders: 0,
        totalSales: 0,
        categorySummary: []
    });

    const [selectedCategory, setSelectedCategory] = useState("");
    const [categoryOrders, setCategoryOrders] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
const recordsPerPage = 4;

// Calculate pagination data
const indexOfLastRecord = currentPage * recordsPerPage;
const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
const currentRecords = categoryOrders.slice(indexOfFirstRecord, indexOfLastRecord);
const totalPages = Math.ceil(categoryOrders.length / recordsPerPage);


    // Fetch Order Summary
    useEffect(() => {
        const fetchOrderSummary = async () => {
            try {
                const response = await axios.get("http://localhost:8000/api/orders/order-summary");
                setOrderSummary(response.data);
            } catch (error) {
                console.error("Error fetching order summary", error);
            }
        };
        fetchOrderSummary();
    }, []);

    // Fetch Orders by Selected Category
    useEffect(() => {
        if (selectedCategory) {
            setCurrentPage(1); // Reset to first page
            axios.get(`http://localhost:8000/api/orders-by-category/${selectedCategory}`)
                .then(res => setCategoryOrders(res.data))
                .catch(err => console.error("Error fetching orders:", err));
        }
    }, [selectedCategory]);

    return (
        <div className="account-container">
            <h2>Order Summary</h2>

            {/* Summary Cards */}
            <div className="summary-container">
                <div className="summary-card">
                    <h3>Total Orders</h3>
                    <span>{orderSummary.totalOrders}</span>
                </div>

                <div className="summary-card">
                    <h3>Total Sales</h3>
                    <span>₹{orderSummary.totalSales.toLocaleString()}</span>
                </div>
            </div>


            {/* Table & Chart Container */}
            <div className="table-chart-container">
                {/* Summary Table */}
                <table className="order-table">
                    <thead>
                        <tr>
                            <th>Category</th>
                            <th>Total Orders</th>
                            <th>Total Sales (₹)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orderSummary.categorySummary.length > 0 ? (
                            orderSummary.categorySummary.map((category) => (
                                <tr key={category._id}>
                                    <td>{category._id || "Uncategorized"}</td>
                                    <td>{category.totalOrders}</td>
                                    <td>₹{category.totalSales.toLocaleString()}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3">No orders found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Chart */}
                <div className="chart-container">
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={orderSummary.categorySummary} margin={{ bottom: 50 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="_id" angle={-30} textAnchor="end" interval={0} />
                            <YAxis 
                                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} 
                                domain={[0, Math.ceil(orderSummary.totalSales / 50000) * 50000]} 
                                ticks={[10000, 50000, 100000, 150000]} 
                            />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="totalOrders" fill="#8884d8" name="Total Orders" />
                            <Bar dataKey="totalSales" fill="#82ca9d" name="Total Sales (₹)" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Category Orders Section */}
            {/* Category Orders Section */}
<div className="category-orders-section">
    <h3>Filter Orders by Category</h3>

    {/* Category Buttons */}
    <div className="category-buttons">
        {orderSummary.categorySummary.map((category) => (
            <button 
                key={category._id} 
                className={selectedCategory === category._id ? "active" : ""}
                onClick={() => setSelectedCategory(category._id)}
            >
                {category._id || "Uncategorized"}
            </button>
        ))}
    </div>

    {/* Orders Table (Only Shows if a Category is Selected) */}
    {selectedCategory && categoryOrders.length > 0 ? (
    <>
        <table className="category-orders-table">
            <thead>
                <tr>
                    <th>Order ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Category</th>
                    <th>Total</th>
                    <th>Quantity</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                {currentRecords.map(order => (
                    <tr key={order.orderId}>
                        <td>{order.orderId}</td>
                        <td>{order.name}</td>
                        <td>{order.email}</td>
                        <td>{order.phone}</td>
                        <td>{order.category}</td>
                        <td>{order.totalPrice}</td>
                        <td>{order.quantity}</td>
                        <td className={`status ${order.status.toLowerCase()}`}>{order.status}</td>
                    </tr>
                ))}
            </tbody>
        </table>

        {/* Pagination Controls */}
        <div className="pagination">
            <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                disabled={currentPage === 1}
            >
                Prev
            </button>

            {Array.from({ length: totalPages }, (_, index) => (
                <button 
                    key={index + 1}
                    className={currentPage === index + 1 ? "active" : ""}
                    onClick={() => setCurrentPage(index + 1)}
                >
                    {index + 1}
                </button>
            ))}

            <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                disabled={currentPage === totalPages}
            >
                Next
            </button>
        </div>
    </>
) : selectedCategory && categoryOrders.length === 0 ? (
    <p>No orders found for this category.</p>
) : null}

</div>

        </div>
    );
};

export default AccountPage;

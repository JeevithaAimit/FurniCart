import React, { useState, useEffect } from "react";
import axios from "axios";
import "./dashboard.css";
import { FaUsers, FaBox, FaShoppingCart, FaBars, FaTimes, FaUserPlus, FaRupeeSign, FaSyncAlt, FaUsersSlash, FaEye, FaEdit, FaTrash, FaSignOutAlt, FaUserTie } from "react-icons/fa";
import AddProduct from "./AddProduct";
import Inventory from "./Inventory";
import OrderManagement from "./orderDetails";
import CustomerDetails from "./CustomerDetails";
import Order from "./Order";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [orders, setOrders] = useState([]);
  const [managers, setManagers] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalSalesPrice, setTotalSalesPrice] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalManagers, setTotalManagers] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
const recordsPerPage = 3;
  const [showAddManagerModal, setShowAddManagerModal] = useState(false);
  const [showEditManagerModal, setShowEditManagerModal] = useState(false);
  const [currentManager, setCurrentManager] = useState(null);
  const [newManager, setNewManager] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'Male',
    password: ''
  });

  const handleAddManager = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/managers", newManager);
      setManagers([...managers, response.data]);
      setTotalManagers(totalManagers + 1);
      setShowAddManagerModal(false);
      setNewManager({
        name: '',
        email: '',
        phone: '',
        gender: 'Male',
        password: ''
      });
    } catch (error) {
      console.error("Error adding manager:", error);
    }
  };
const indexOfLastRecord = currentPage * recordsPerPage;
const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
const currentManagers = managers.slice(indexOfFirstRecord, indexOfLastRecord);
const totalPages = Math.ceil(managers.length / recordsPerPage);

  // Edit Manager Functions
  const handleEditClick = (manager) => {
    setCurrentManager(manager);
    setShowEditManagerModal(true);
  };

  const handleUpdateManager = async () => {
    try {
      const response = await axios.patch(
        `http://localhost:5000/api/managers/${currentManager._id}`,
        currentManager
      );
      setManagers(managers.map(m => m._id === currentManager._id ? response.data : m));
      setShowEditManagerModal(false);
    } catch (error) {
      console.error("Error updating manager:", error);
    }
  };

  // Delete Manager Function
  const handleDeleteManager = async (id) => {
    if (window.confirm("Are you sure you want to delete this manager?")) {
      try {
        await axios.delete(`http://localhost:5000/api/managers/${id}`);
        setManagers(managers.filter(manager => manager._id !== id));
        setTotalManagers(totalManagers - 1);
      } catch (error) {
        console.error("Error deleting manager:", error);
      }
    }
  };

  
  useEffect(() => {
    if (!localStorage.getItem("isAuthenticated")) {
      navigate("/login");
    }
    setLoading(true);
    fetchInventoryData();
    fetchTotalCustomers();
    fetchTotalOrders();
    fetchManagers();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate("/login");
  };

  const fetchInventoryData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/products");
      if (!Array.isArray(response.data)) throw new Error("Invalid response format");

      let totalProductsCount = response.data.length;
      let totalSales = response.data.reduce((acc, item) => acc + (parseFloat(item.price) || 0), 0);

      setTotalProducts(totalProductsCount);
      setTotalSalesPrice(totalSales);
    } catch (error) {
      console.error("❌ Error fetching inventory data:", error);
    }
  };

  const fetchTotalCustomers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/customers");
      if (!Array.isArray(response.data)) throw new Error("Invalid response format");
  
      setTotalCustomers(response.data.length);
    } catch (error) {
      console.error("❌ Error fetching customer count:", error);
    }
  };
  
  const fetchTotalOrders = async () => {
    try {
      const response = await axios.get("http://localhost:5000/orders");
      if (!Array.isArray(response.data)) throw new Error("Invalid response format");

      setTotalOrders(response.data.length);
      setOrders(response.data);

      const totalOrderPrice = response.data.reduce((acc, order) => acc + (parseFloat(order.totalPrice) || 0), 0);
      
      setTotalSalesPrice(totalOrderPrice);
    } catch (error) {
      console.error("❌ Error fetching total orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchManagers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/managers");
      if (!Array.isArray(response.data)) throw new Error("Invalid response format");

      setManagers(response.data);
      setTotalManagers(response.data.length);
    } catch (error) {
      console.error("❌ Error fetching managers:", error);
    }
  };

  const formatRupeesInLakhs = (value) =>
    value >= 100000 ? `₹${(value / 100000).toFixed(1)}L` : `₹${value.toLocaleString()}`;

 const renderActiveSection = () => {
  switch (activeSection) {
    case "dashboard":
      return (
        <>
          <div className="dashboard-stats">
            <div className="stats-grid">
              <div className="stat-card customers">
                <div className="card-icon">
                  <FaUsers />
                </div>
                <div className="card-content">
                  <h3>Total Customers</h3>
                  <p>{totalCustomers}</p>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '75%' }}></div>
                  </div>
                </div>
              </div>

              <div className="stat-card orders">
                <div className="card-icon">
                  <FaShoppingCart />
                </div>
                <div className="card-content">
                  <h3>Total Orders</h3>
                  <p>{totalOrders}</p>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '60%' }}></div>
                  </div>
                </div>
              </div>

              <div className="stat-card products">
                <div className="card-icon">
                  <FaBox />
                </div>
                <div className="card-content">
                  <h3>Total Products</h3>
                  <p>{totalProducts}</p>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '85%' }}></div>
                  </div>
                </div>
              </div>

              <div className="stat-card sales">
                <div className="card-icon">
                  <FaRupeeSign />
                </div>
                <div className="card-content">
                  <h3>Total Sales</h3>
                  <p>{formatRupeesInLakhs(totalSalesPrice)}</p>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '90%' }}></div>
                  </div>
                </div>
              </div>

              <div className="stat-card managers">
                <div className="card-icon">
                  <FaUserTie />
                </div>
                <div className="card-content">
                  <h3>Total Managers</h3>
                  <p>{totalManagers}</p>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '45%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

         <div className="dashboard-section">
              <div className="section-header">
                <div className="header-title">
                  <h2>Manager Details</h2>
                  <p>Overview of all registered managers</p>
                </div>
                <div className="header-actions">
                  <button className="action-btn refresh" onClick={fetchManagers}>
                    <FaSyncAlt /> Refresh
                  </button>
                  <button className="action-btn add" onClick={() => setShowAddManagerModal(true)}>
                    <FaUserPlus /> Add Manager
                  </button>
                </div>
              </div>

              <div className="section-content">
                {managers.length > 0 ? (
                  <div className="premium-table-container">
                    <table className="premium-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Phone</th>
                          <th>Gender</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
              <tbody>
  {currentManagers.map((manager) => (
    <tr key={manager._id}>
      <td>
        <div className="user-info">
          <div className="user-avatar">
            {manager.name.charAt(0)}
          </div>
          <div className="user-details">
            <span className="user-name">{manager.name}</span>
            <span className="user-role">{manager.email}</span>
          </div>
        </div>
      </td>
      <td>{manager.phone}</td>
      <td>
        <span className={`status-badge gender ${manager.gender.toLowerCase()}`}>
          {manager.gender}
        </span>
      </td>
     <td>
  <span className={`status-badge ${manager.status?.toLowerCase()}`}>
    {manager.status}
  </span>
</td>

      <td>
        <div className="action-buttons">
          <button className="btn-edit1" onClick={() => handleEditClick(manager)}>
            <FaEdit />
          </button>
          <button className="btn-delete1" onClick={() => handleDeleteManager(manager._id)}>
            <FaTrash />
          </button>
        </div>
      </td>
    </tr>
  ))}
</tbody>

                    </table>
                    <div className="pagination-controls">
  <button
    disabled={currentPage === 1}
    onClick={() => setCurrentPage(currentPage - 1)}
  >
    Prev
  </button>
  {[...Array(totalPages)].map((_, index) => (
    <button
      key={index}
      className={currentPage === index + 1 ? "active" : ""}
      onClick={() => setCurrentPage(index + 1)}
    >
      {index + 1}
    </button>
  ))}
  <button
    disabled={currentPage === totalPages}
    onClick={() => setCurrentPage(currentPage + 1)}
  >
    Next
  </button>
</div>

                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon">
                      <FaUsersSlash />
                    </div>
                    <h3>No Managers Found</h3>
                    <p>There are currently no managers registered in the system</p>
                    <button className="btn-primary" onClick={() => setShowAddManagerModal(true)}>
                      <FaUserPlus /> Add New Manager
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Add Manager Modal */}
            {showAddManagerModal && (
              <div className="modal-overlay">
                <div className="modal">
                  <h2>Add New Manager</h2>
                  <div className="form-group">
                    <label>Name</label>
                    <input
                      type="text"
                      value={newManager.name}
                      onChange={(e) => setNewManager({...newManager, name: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={newManager.email}
                      onChange={(e) => setNewManager({...newManager, email: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="text"
                      value={newManager.phone}
                      onChange={(e) => setNewManager({...newManager, phone: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Gender</label>
                    <select
                      value={newManager.gender}
                      onChange={(e) => setNewManager({...newManager, gender: e.target.value})}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input
                      type="password"
                      value={newManager.password}
                      onChange={(e) => setNewManager({...newManager, password: e.target.value})}
                    />
                  </div>
                  <div className="modal-actions">
                    <button className="btn-cancel" onClick={() => setShowAddManagerModal(false)}>
                      Cancel
                    </button>
                    <button className="btn-confirm" onClick={handleAddManager}>
                      Add Manager
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Manager Modal */}
            {showEditManagerModal && currentManager && (
              <div className="modal-overlay">
                <div className="modal">
                  <h2>Edit Manager</h2>
                  <div className="form-group">
                    <label>Name</label>
                    <input
                      type="text"
                      value={currentManager.name}
                      onChange={(e) => setCurrentManager({...currentManager, name: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={currentManager.email}
                      onChange={(e) => setCurrentManager({...currentManager, email: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="text"
                      value={currentManager.phone}
                      onChange={(e) => setCurrentManager({...currentManager, phone: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Gender</label>
                    <select
                      value={currentManager.gender}
                      onChange={(e) => setCurrentManager({...currentManager, gender: e.target.value})}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="modal-actions">
                    <button className="btn-cancel" onClick={() => setShowEditManagerModal(false)}>
                      Cancel
                    </button>
                    <button className="btn-confirm" onClick={handleUpdateManager}>
                      Update Manager
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        );
      
    case "customers":
      return <CustomerDetails />;
    case "orders":
      return <Order />;
    case "addProduct":
      return <AddProduct />;
    case "inventory":
      return <Inventory />;
    case "orderManagement":
      return <OrderManagement />;
    case "managers":
      return (
        <div className="dashboard-section">
          {/* Manager table content same as in dashboard case */}
        </div>
      );
    default:
      return <div>Select a section from the sidebar</div>;
  }
};

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <button className="close-btn" onClick={() => setSidebarOpen(false)}>
          <FaTimes />
        </button>
        <div className="dashboard">
          <h2>Admin Panel</h2>
        </div>
        <ul>
          {["dashboard", "customers", "orders", "addProduct", "inventory", "orderManagement"].map((section) => (
            <li key={section}>
              <button
                className={`sidebar-btn ${activeSection === section ? "active" : ""}`}
                onClick={() => setActiveSection(section)}
              >
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </button>
            </li>
          ))}
          <button
            className="manager-btn"
            onClick={() => window.open("http://localhost:3001/", "_blank")}
          >
            Manager Login
          </button>
        </ul>
        <br /><br /><br /><br />
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
          <FaBars />
        </button>

        {renderActiveSection()}
      </div>
    </div>
  );
};

export default Dashboard;
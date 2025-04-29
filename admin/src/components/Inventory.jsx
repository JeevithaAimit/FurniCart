import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import "./inventory.css";

const Inventory = () => {
  const [categorizedData, setCategorizedData] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalSalesPrice, setTotalSalesPrice] = useState(0);
  const [availableProducts, setAvailableProducts] = useState(0);
  const [unavailableProducts, setUnavailableProducts] = useState(0);
  const [popupCategory, setPopupCategory] = useState(null);
  const [categoryProducts, setCategoryProducts] = useState({});

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/inventory/category-summary");
      const { categories, allProducts } = response.data;
  
      let totalProductCount = 0;
      let totalSales = 0;
      let availableCount = 0;
      let unavailableCount = 0;
      const productsByCategory = {};
  
      // Summing up category-level totals
      categories.forEach((category) => {
        totalProductCount += category.totalProducts;
        totalSales += category.totalSalesPrice;
      });
  
      // Counting available/unavailable and categorizing products
      allProducts.forEach((product) => {
        const category = product.category || "Uncategorized";
        if (!productsByCategory[category]) {
          productsByCategory[category] = [];
        }
        productsByCategory[category].push(product);
  
        if (product.quantity > 0) {
          availableCount++;
        } else {
          unavailableCount++;
        }
      });
  
      // Set state
      setCategorizedData(categories);
      setCategoryProducts(productsByCategory);
      setTotalProducts(totalProductCount);
      setTotalSalesPrice(totalSales);
      setAvailableProducts(availableCount);
      setUnavailableProducts(unavailableCount);
    } catch (error) {
      console.error("Error fetching inventory data:", error);
    }
  };
  

  const formatRupeesInLakhs = (value) => `₹${(value / 100000).toFixed(2)}L`;


  
  return (
    <div className="inventory-container">
      <h2>Inventory Overview</h2>

      {/* Summary Cards */}
      <div className="inventory-summary">
        <div className="summary-card">
          <h3>Total Products</h3>
          <p>{totalProducts}</p>
        </div>
        <div className="summary-card">
          <h3>Total Sales Price</h3>
          <p>{formatRupeesInLakhs(totalSalesPrice)}</p>
        </div>
        <div className="summary-card available">
          <h3>Available Products</h3>
          <p className="totalavailabale">{availableProducts}</p>
        </div>
        <div className="summary-card unavailable">
          <h3>Unavailable Products</h3>
          <p className="totalUnavailabale">{unavailableProducts}</p>
        </div>
      </div>

      {/* Category Cards */}
      <div className="category-cards">
  {categorizedData.slice(0, 9).map((cat) => {
    const products = categoryProducts[cat.category] || [];
    const available = products.filter(p => p.quantity > 0).length;
    const unavailable = products.filter(p => p.quantity === 0).length;

    return (
      <div
        key={cat.category}
        className="category-card"
        onClick={() => setPopupCategory(cat.category)}
      >
        <h4>{cat.category}</h4>
        <p className="available-count">Available: {available}</p>
        <p className="unavailable-count">Unavailable: {unavailable}</p>
      </div>
    );
  })}
</div>


      {/* Table for Categorized Data */}
      <table className="inventory-table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Total Products</th>
            <th>Total Sales Price</th>
          </tr>
        </thead>
        <tbody>
          {categorizedData.map((item) => (
            <tr key={item.category}>
              <td>{item.category}</td>
              <td className={item.totalProducts < 5 ? "low-stock" : ""}>
                {item.totalProducts}
              </td>
              <td>{formatRupeesInLakhs(item.totalSalesPrice)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Graph Visualization */}
      <div className="chart-container">
        <h3>Inventory Sales Chart</h3>
        <ResponsiveContainer width="90%" height={300}>
          <BarChart data={categorizedData} margin={{ top: 10, right: 20, left: 10, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5} />
            <XAxis dataKey="category" tick={{ fill: "#333", fontSize: 14 }} />
            <YAxis tickFormatter={formatRupeesInLakhs} tick={{ fill: "#333", fontSize: 14 }} />
            <Tooltip formatter={(value) => `₹${(value / 100000).toFixed(2)}L`} />
            <Legend />
            <Bar
              dataKey="totalSalesPrice"
              fill="url(#colorGradient)"
              barSize={40}
              radius={[10, 10, 0, 0]}
              animationDuration={800}
            />
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4CAF50" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#8BC34A" stopOpacity={0.6} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Modal Popup */}
      {popupCategory && (
        <div className="modal-overlay" onClick={() => setPopupCategory(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setPopupCategory(null)}>X</button>
            <h3>{popupCategory} Products</h3>
            <div className="status-counts">
              <span className="available">
                Available: {categoryProducts[popupCategory]?.filter(p => p.quantity > 0).length}
              </span>
              <span className="unavailable">
                Unavailable: {categoryProducts[popupCategory]?.filter(p => p.quantity === 0).length}
              </span>
            </div>
            <table className="popup-product-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {categoryProducts[popupCategory]?.map((p) => (
                  <tr key={p._id}>
                    <td>{p.name}</td>
                    <td>₹{p.price}</td>
                    <td>{p.quantity}</td>
                    <td style={{ color: p.quantity > 0 ? "green" : "red" }}>
                      {p.quantity > 0 ? "Available" : "Unavailable"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;

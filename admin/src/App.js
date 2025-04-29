import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Inventory from "./components/Inventory";
import AddProduct from "./components/AddProduct";
import Login from "./components/Login";
import Package from "./components/orderDetails"; // ✅ Corrected import




import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/add-product" element={<AddProduct />} />
        <Route path="/ordermanagement" element={<Package />} /> {/* ✅ Corrected usage */}
        <Route path="/" element={<Login />} />

      </Routes>
    </Router>
  );
}

export default App;

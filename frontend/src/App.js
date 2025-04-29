import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Header from "./components/Header";
import HeroSection from "./components/herosection";
import TopSelling from "./components/TopSelling";
import Footer from "./components/Footer";
import Banner from "./components/Banner";
import Category from "./components/Category";
import ProductDetails from "./pages/ProductDetails"; // ✅ Import Product Details Page
import Cart from "./pages/Cart"; 
import LoginPage from "./pages/LoginPage"; 


// ✅ Import Category Pages
import Sofa from "./pages/Sofa";
import BeanBags from "./pages/BeanBags";
import Chair from "./pages/Chair";
import Shoe from "./pages/Shoe";
import Bedroom from "./pages/Bedroom";
import Dining from "./pages/Dining";
import Table from "./pages/Table";
import Wardrobes from "./pages/Wardrobes";
import Book from "./pages/Book";
import About from "./pages/About";
import TermsConditions from './pages/TermsConditions';
import Shipping from "./pages/Shipping";
import Warranty from './pages/Warranty';
import Privacy from './pages/Privacy';
import FAQ from './pages/FAQ';
import Checkout from "./pages/Checkout";
import Tracking from "./pages/Tracking";





function App() {
  return (
    <Router>
      <Header />
      
      <Routes>
        {/* ✅ Home Page */}
        <Route path="/" element={
          <>
            <HeroSection />
            <TopSelling />
            <Banner />
            <Category />
          </>
        } />

        {/* ✅ Product List Pages */}
        <Route path="/products/sofa" element={<Sofa />} />
        <Route path="/products/beanbags" element={<BeanBags />} />
        <Route path="/products/chair" element={<Chair />} />
        <Route path="/products/shoe" element={<Shoe />} />
        <Route path="/products/bedroom" element={<Bedroom />} />
        <Route path="/products/dining" element={<Dining />} />
        <Route path="/products/table" element={<Table />} />
        <Route path="/products/wardrobes" element={<Wardrobes />} />
        <Route path="/products/book" element={<Book />} />
        

        {/* ✅ Product Details Page */}
        <Route path="/product/:productId" element={<ProductDetails />} />

        {/* ✅ About Page */}
        <Route path="/about" element={<About />} />


        {/* ✅ Terms & Conditions Page */}
        <Route path="/terms-and-conditions" element={<TermsConditions />} />

        {/* ✅ Shipping Page */}
        <Route path="/Shipping-policy" element={<Shipping />} />

        {/* ✅ Warranty Page */}
        <Route path="/Warranty" element={<Warranty />} />

        {/* ✅ Privacy Policy Page */}
        <Route path="/Privacy-policy" element={<Privacy />} />

        {/* ✅ FAQ Page */}
        <Route path="/FAQ" element={<FAQ />} />

        {/* ✅ Cart Page */}
        <Route path="/cart" element={<Cart />} />

        <Route path="/login" element={<LoginPage />} />

        <Route path="/checkout" element={<Checkout />} />

        <Route path="/Tracking" element={<Tracking />} />


      </Routes>

      {/* ✅ WhatsApp Floating Button */}
      <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="whatsapp-float">
        <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="whatsapp-icon" />
      </a>

      <Footer />
    </Router>
  );
}

export default App;

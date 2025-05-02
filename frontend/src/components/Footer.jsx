import React, { useState } from "react";
import "./footer.css";
import { Link } from "react-router-dom";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
import axios from "axios";

const Footer = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8500/api/contact", formData);

      alert("Message sent successfully!");
      setFormData({ name: "", email: "", phone: "", message: "" }); // clear form
    } catch (error) {
      console.error(error);
      alert("Failed to send message");
    }
  };

  return (
    <footer className="footer">
      <div className="footer-section">
        <h4>CONTACT US</h4>
        <form className="contact-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Your Name*"
            required
            value={formData.name}
            onChange={handleChange}
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email*"
            required
            value={formData.email}
            onChange={handleChange}
          />
          <input
            type="tel"
            name="phone"
            placeholder="Your Phone*"
            required
            value={formData.phone}
            onChange={handleChange}
          />
          <textarea
            name="message"
            placeholder="Your Message*"
            required
            value={formData.message}
            onChange={handleChange}
          ></textarea>
          <button type="submit">SEND</button>
        </form>
      </div>

      <div className="footer-section">
        <h4>QUICK LINK</h4>
        <ul className="category-list">
          <li><Link to="/products/Sofa">Sofas Sets</Link></li>
          <li><Link to="/products/BeanBags">Bean Bags</Link></li>
          <li><Link to="/products/Chair">Chairs</Link></li>
          <li><Link to="/products/Shoe">Shoe Racks</Link></li>
          <li><Link to="/products/Bedroom">Bedroom Sets</Link></li>
          <li><Link to="/products/Dining">Dining Sets</Link></li>
          <li><Link to="/products/Table">Study Tables</Link></li>
          <li><Link to="/products/Wardrobes">Wardrobes</Link></li>
          <li><Link to="/products/Bookshelf">Book Shelves</Link></li>
        </ul>
      </div>

      <div className="footer-section">
        <h4>INFORMATION</h4>
        <ul className="category-info">
          <li><Link to="/About">About</Link></li>
          <li><Link to="/terms-and-conditions">Terms and Conditions</Link></li>
          <li><Link to="/shipping-policy">Shipping Policy</Link></li>
          <li><Link to="/warranty">Warranty</Link></li>
          <li><Link to="/privacy-policy">Privacy Policy</Link></li>
          <li><Link to="/faq">FAQ</Link></li>
          <li><Link to="/contact">Contact Us</Link></li>
        </ul>
        <div className="social-media">
          <div className="social-icons">
            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebook /></a>
            <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
            <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
          </div>
        </div>
      </div>

      <div className="recaptcha-notice">
        <p className="contact-details">
          📞 Phone: 0824-2988298 | 📱 Mobile: +91 8892882988 | ✉ Email: info@kakunjesoftware.com
        </p>
        This site is protected by reCAPTCHA. Google's <a href="https://policies.google.com/privacy">Privacy Policy</a> and <a href="https://policies.google.com/terms">Terms of Service</a> apply.
      </div>
    </footer>
  );
};

export default Footer;












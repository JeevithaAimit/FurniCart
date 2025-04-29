import React from "react";
import "./footer.css";
import { Link } from "react-router-dom";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-section">
        <h4>CONTACT US</h4>
        <form className="contact-form">
          <input type="text" placeholder="Your Name*" required />
          <input type="email" placeholder="Your Email*" required />
          <input type="tel" placeholder="Your Phone*" required />
          <textarea placeholder="Your Message*" required></textarea>
          <button type="submit">SEND</button>
        </form>
      </div>

      <div className="footer-section">
        <ul className="category-list">
          <h4>QUICK LINK</h4>
          <li><a href="/products/Sofa">Sofas Sets</a></li>
          <li><a href="/products/BeanBags">Bean Bags</a></li>
          <li><a href="/products/Chair">Chairs</a></li>
          <li><a href="/products/Shoe">Shoe Racks</a></li>
          <li><a href="/products/Bedroom">Bedroom Sets</a></li>
          <li><a href="/products/Dining">Dining Sets</a></li>
          <li><a href="/products/Table">Study Tables</a></li>
          <li><a href="/products/Wardrobes">Wardrobes</a></li>
          <li><a href="/products/">Book Shelfs</a></li>
        </ul>
      </div>

      <div className="footer-section">
        <ul className="category-info">
          <h4>INFORMATION</h4>
          <li><Link to="/About">About</Link></li>
          <li><a href="/terms-and-conditions">Terms and Conditions</a></li>
          <li><a href="/shipping-policy">Shipping policy</a></li>
          <li><a href="/warranty">Warranty</a></li>
          <li><a href="/privacy-policy">Privacy policy</a></li>
          <li><a href="/faq">FAQ</a></li>
          <li><a href="/">Contact us</a></li>
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
        <p className="contact-details">📞 Phone: 0824-2988298 | 📱 Mobile: +91 8892882988 | ✉ Email: info@kakunjesoftware.com</p>
        This site is protected by reCAPTCHA. Google's <a href="https://policies.google.com/privacy">Privacy Policy</a> and <a href="https://policies.google.com/terms">Terms of Service</a> apply.
      </div>
    </footer>
  );
};

export default Footer;


import React from 'react';
import HeroSection from "../components/herosection";
import './termsCondition.css';

const TermsAndConditions = () => {
    return (
      <div className="page-container">
        <HeroSection />
        <section className="content-section">
          <h1>Terms and Conditions</h1>
          <p>Welcome to FurniCart! Please read these Terms and Conditions carefully before using our website.</p>
  
          <div className="highlight-box">
            <h2>1. Introduction</h2>
            <p>By accessing and using our website, you agree to comply with these terms. If you do not agree, please do not use our services.</p>
          </div>
  
          <div className="highlight-box">
            <h2>2. Use of the Website</h2>
            <p>You agree to use the website only for lawful purposes. You may not engage in any activity that disrupts or interferes with the website's functioning.</p>
          </div>
  
          <div className="highlight-box">
            <h2>3. Products and Pricing</h2>
            <p>All product prices are subject to change without notice. We reserve the right to modify or discontinue products without liability.</p>
          </div>
  
          <div className="highlight-box">
            <h2>4. Orders and Payments</h2>
            <p>By placing an order, you agree to provide accurate and complete information. Payment must be made using our accepted methods.</p>
          </div>
  
          <div className="highlight-box">
            <h2>5. Shipping and Delivery</h2>
            <p>We aim to deliver your orders within the estimated time frame. However, delivery times may vary depending on location and unforeseen circumstances.</p>
          </div>
  
          <div className="highlight-box">
            <h2>6. Returns and Refunds</h2>
            <p>Please refer to our Return Policy for detailed information on returns and refunds.</p>
          </div>
  
          <div className="highlight-box">
            <h2>7. Privacy Policy</h2>
            <p>Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your personal information.</p>
          </div>
  
          <div className="highlight-box">
            <h2>8. Changes to Terms</h2>
            <p>We reserve the right to update or modify these terms at any time. Please check this page periodically for any changes.</p>
          </div>
  
          <div className="highlight-box contact-box">
            <h2>9. Contact Us</h2>
            <p>If you have any questions about these Terms and Conditions, feel free to contact us at support@furnicart.com.</p>
          </div>
        </section>
      </div>
    );
  };
  
  export default TermsAndConditions;
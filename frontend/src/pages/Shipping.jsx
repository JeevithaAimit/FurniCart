import React from 'react';
import './shipping.css';
import HeroSection from "../components/herosection";

const ShippingPolicy = () => {
  return (
    <div className="page-container">
      <HeroSection />
      <section className="content-section">
        <h1>Shipping Policy</h1>
        <p>At FurniCart, we are committed to delivering your order as quickly and efficiently as possible. Please read our shipping policy to understand the details of our process.</p>

        <div className="highlight-box">
          <h2>1. Shipping Locations</h2>
          <p>We offer shipping to most locations across the country. Unfortunately, we do not ship internationally at the moment.</p>
        </div>

        <div className="highlight-box">
          <h2>2. Processing Time</h2>
          <p>Orders are processed within 1-2 business days. During peak seasons, processing times may vary.</p>
        </div>

        <div className="highlight-box">
          <h2>3. Estimated Delivery Time</h2>
          <p>Delivery times vary depending on your location. Standard shipping typically takes 5-7 business days. You will receive tracking information once your order has been shipped.</p>
        </div>

        <div className="highlight-box">
          <h2>4. Shipping Fees</h2>
          <p>We offer free shipping on orders above $100. For orders below $100, a standard shipping fee of $10 will apply.</p>
        </div>

        <div className="highlight-box">
          <h2>5. Tracking Your Order</h2>
          <p>Once your order is shipped, you will receive an email with tracking information. You can also track your order on our website using your order ID.</p>
        </div>

        <div className="highlight-box contact-box">
          <h2>6. Contact Us</h2>
          <p>If you have any questions or concerns regarding your order, please contact our support team at support@furnicart.com.</p>
        </div>
      </section>
    </div>
  );
};

export default ShippingPolicy;
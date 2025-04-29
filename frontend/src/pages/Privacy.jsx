import React from 'react';
import './privacy.css';
import HeroSection from "../components/herosection";

const PrivacyPolicy = () => {
  return (
    <div className="page-container">
      <HeroSection />
      <section className="content-section">
        <h1>Privacy Policy</h1>
        <p>Your privacy is important to us. This Privacy Policy outlines how we collect, use, and protect your personal information.</p>

        <div className="highlight-box">
          <h2>1. Information We Collect</h2>
          <p>We collect personal information such as your name, email address, phone number, and payment information when you place an order or contact us.</p>
        </div>

        <div className="highlight-box">
          <h2>2. How We Use Your Information</h2>
          <p>Your information is used to process orders, provide customer support, and send updates regarding your order status.</p>
        </div>

        <div className="highlight-box">
          <h2>3. Data Security</h2>
          <p>We implement secure measures to protect your data from unauthorized access and ensure your information remains safe.</p>
        </div>

        <div className="highlight-box">
          <h2>4. Cookies</h2>
          <p>Our website uses cookies to enhance your browsing experience. You can manage your cookie preferences in your browser settings.</p>
        </div>

        <div className="highlight-box">
          <h2>5. Third-Party Services</h2>
          <p>We may use third-party services for analytics and payment processing. These services have their own privacy policies.</p>
        </div>

        <div className="highlight-box contact-box">
          <h2>6. Contact Us</h2>
          <p>If you have any questions regarding our privacy policy, please contact us at privacy@furnicart.com.</p>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
import React from 'react';
import './warranty.css';
import HeroSection from "../components/herosection";

const Warranty = () => {
  return (
    <div className="page-container">
      <HeroSection />
      <section className="content-section">
        <h1>Warranty</h1>
        <p>Thank you for shopping with FurniCart. We stand by the quality of our products and offer a comprehensive warranty to ensure your satisfaction.</p>

        <div className="highlight-box">
          <h2>1. Warranty Coverage</h2>
          <p>We offer a limited warranty that covers manufacturing defects in materials and workmanship under normal use for a period of 12 months from the date of purchase.</p>
        </div>

        <div className="highlight-box">
          <h2>2. What’s Not Covered?</h2>
          <p>The warranty does not cover damages caused by misuse, neglect, accidental damage, improper assembly, or natural wear and tear.</p>
        </div>

        <div className="highlight-box">
          <h2>3. How to Claim Warranty</h2>
          <p>To initiate a warranty claim, please contact our support team at support@furnicart.com with proof of purchase, photographs of the damage, and a brief description of the issue.</p>
        </div>

        <div className="highlight-box">
          <h2>4. Resolution Process</h2>
          <p>Upon verifying your claim, we may choose to repair, replace, or provide a partial refund for the defective product at our discretion.</p>
        </div>

        <div className="highlight-box contact-box">
          <h2>5. Contact Us</h2>
          <p>If you have any questions or need further assistance, please contact us at support@furnicart.com. We're here to help!</p>
        </div>
      </section>
    </div>
  );
};

export default Warranty;
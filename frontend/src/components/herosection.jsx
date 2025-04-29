import React from "react";
import "./herosection.css";

const heroImage =
  "https://plus.unsplash.com/premium_photo-1661963198655-a671a1f06d25?q=80&w=1931&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

const HeroSection = () => {
  return (
    <section className="hero">
      <div
        className="hero-banner"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="overlay">
          <h2>
            <span>Furniture So Stylish,</span>
            <span>Even Your Guests Will Take Selfies With It!</span>
          </h2>
          <a href="/products/Watch" className="btn">
            SHOP NOW
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

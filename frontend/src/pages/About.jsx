import React from "react";
import HeroSection from "../components/herosection";
import "./about.css";

// Sample images for team members and brand partners
const teamMembers = [
  { name: "Emma Johnson", role: "CEO & Founder", img: "https://via.placeholder.com/120" },
  { name: "Michael Smith", role: "Lead Designer", img: "https://via.placeholder.com/120" },
  { name: "Sophia Brown", role: "Marketing Head", img: "https://via.placeholder.com/120" },
];

const brandPartners = [
  { name: "Brand A", img: "https://via.placeholder.com/100x50" },
  { name: "Brand B", img: "https://via.placeholder.com/100x50" },
  { name: "Brand C", img: "https://via.placeholder.com/100x50" },
];

const About = () => {
  return (
    <div className="about-page">
      <HeroSection />
      
      <section className="about-content">
        <div className="container">
          <h1>About Us</h1>
          <p>
            Welcome to our store! We specialize in stylish and high-quality furniture
            designed to transform your living space. Our passion is bringing you
            unique and comfortable pieces that elevate your home decor.
          </p>
          <p>
            Whether you're looking for modern, vintage, or contemporary styles,
            we have something for every taste. Explore our collection today and
            make your home a masterpiece!
          </p>
        </div>
      </section>
      
      <section className="our-mission">
        <div className="container">
          <h2>Our Mission</h2>
          <p>
            Our mission is to provide high-quality furniture that combines functionality,
            durability, and style. We aim to make home decor shopping easy and enjoyable
            by offering a wide range of products at competitive prices.
          </p>
        </div>
      </section>
      
      <section className="why-choose-us">
        <div className="container">
          <h2>Why Choose Us?</h2>
          <ul>
            <li>✔ Premium Quality Products</li>
            <li>✔ Affordable Pricing</li>
            <li>✔ Fast & Secure Shipping</li>
            <li>✔ Excellent Customer Support</li>
            <li>✔ Easy Returns & Refunds</li>
          </ul>
        </div>
      </section>
      
      <section className="customer-reviews">
        <div className="container">
          <h2>What Our Customers Say</h2>
          <p>⭐⭐⭐⭐⭐ "Great quality furniture and fantastic service!" - Jane D.</p>
          <p>⭐⭐⭐⭐⭐ "Love my new sofa! Fast delivery and easy setup." - Mark S.</p>
        </div>
      </section>

      <section className="our-team">
        <div className="container">
          <h2>Meet Our Team</h2>
          <div className="team-members">
            {teamMembers.map((member, index) => (
              <div className="team-card" key={index}>
                <img src={member.img} alt={member.name} />
                <h3>{member.name}</h3>
                <p>{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="brand-partners">
        <div className="container">
          <h2>Our Trusted Brand Partners</h2>
          <div className="partners">
            {brandPartners.map((partner, index) => (
              <img src={partner.img} alt={partner.name} key={index} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
import React, { useState, useEffect } from "react";
import "./banner.css";

const slides = [
  {
    id: 1,
    image: "https://t4.ftcdn.net/jpg/08/79/76/19/360_F_879761917_TgfxnSfrTpn9aIgsY0IZdQN6d4ZWlaXH.jpg",
    text: "Relax in Style — Discover Sofas That Define Comfort!",
    discount: "Flat 30% Off!",
    buttonText: "Explore Sofas",
    link: "/products/Sofa",
  },
  {
    id: 2,
    image: "https://png.pngtree.com/background/20230823/original/pngtree-warm-and-inviting-dining-room-with-mock-up-poster-featuring-green-picture-image_4786844.jpg",
    text: "Elevate Every Meal with Timeless Dining Sets!",
    discount: "Up to 40% Off!",
    buttonText: "Shop Dining Sets",
    link: "/products/Dining",
  },
  {
    id: 3,
    image: "https://png.pngtree.com/thumb_back/fw800/background/20240715/pngtree-modern-home-library-design-image_16011896.jpg",
    text: "Organize in Style: Find Your Perfect Bookshelf!",
    discount: "Limited Time Deal: 25% Off",
    buttonText: "Discover Book Shelves",
    link: "/products/Book",
  },
  {
    id: 4,
    image: "https://www.giffywalls.in/cdn/shop/files/8056Bed10ornamental-damask-delight-repeat-pattern-wallpaper_9ff6d505-4d3c-48d5-a105-3b238ecc7a46.jpg?quality=90&v=1734171325&width=1326",
    // https://lifencolors.in/cdn/shop/files/bedroom_horizontal.webp?v=1730195112&width=1500
    text: "Dream in Comfort — Create Your Perfect Sanctuary with Our Elegant Bedroom Sets!",
    discount: "Exclusive 50% Off!",
    buttonText: "Browse Bedroom Sets",
    link: "/products/Bedroom",
  },
  {
    id: 5,
    image: "https://cdn.sharps.co.uk/media/assets/pages/bedrooms/walk-in-wardrobes/wiw-sherboure-white-banner-07.jpg",
    text: "Style Meets Storage — Discover Wardrobes Designed for Every Space!",
    discount: "Save 35% on Headphones",
    buttonText: "Check Wardrobes",
    link: "/products/Wardrobes",
  },
];

const HeroSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const slideInterval = 3000;
  const transitionDuration = 600;

  useEffect(() => {
    const interval = setInterval(() => {
      goToNextSlide();
    }, slideInterval);
    return () => clearInterval(interval);
  }, [currentIndex]);

  const goToNextSlide = () => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
      setTimeout(() => setIsTransitioning(false), transitionDuration);
    }
  };

  const goToPrevSlide = () => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
      setTimeout(() => setIsTransitioning(false), transitionDuration);
    }
  };

  return (
    <section className="hero">
      <div className="slider">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`slide ${index === currentIndex ? "active" : ""}`}
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className="overlay">
              <h2>{slide.text}</h2>
              <p className="discount">{slide.discount}</p>
              <a href={slide.link} className="btn">
                {slide.buttonText}
              </a>
            </div>
          </div>
        ))}
        <button className="arrow left" onClick={goToPrevSlide}>&#10094;</button>
        <button className="arrow right" onClick={goToNextSlide}>&#10095;</button>
      </div>
    </section>
  );
};

export default HeroSection;





import React from "react";
import "./logo.css";

const brands = [
    { id: 1, name: "Apple", logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" },
    { id: 2, name: "Samsung", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Samsung_Logo.svg/512px-Samsung_Logo.svg.png" },
    { id: 3, name: "Sony", logo: "https://1000logos.net/wp-content/uploads/2017/06/Sony-Logo.png" },
    { id: 4, name: "Dell", logo: "https://1000logos.net/wp-content/uploads/2017/07/Dell-Logo.png" }, // Dell Logo
    { id: 5, name: "HP", logo: "https://1000logos.net/wp-content/uploads/2017/02/HP-Log%D0%BE.png" },
    { id: 6, name: "Panasonic", logo: "https://1000logos.net/wp-content/uploads/2022/12/Panasonic-logo.png" }, // Updated Lenovo Logo
    { id: 7, name: "LG", logo: "https://1000logos.net/wp-content/uploads/2017/03/LG-Logo.png" },

//   { id: 7, name: "LG", logo: "https://tse4.mm.bing.net/th?id=OIP.xnCmeIubOmmCx9j5jcAd4QHaEK&pid=Api&P=0&h=180" },
//   { id: 8, name: "Fire-Boltt", logo: "https://tse1.mm.bing.net/th?id=OIP.JT0_TBVTXuvmvh_MsV0chAHaHa&pid=Api&P=0&h=180" }, // Updated Fire-Boltt Logo
//   { id: 9, name: "Noise", logo: "https://tse3.mm.bing.net/th?id=OIP.luOaKgUBzgf-pgPhzDLP3QHaB8&pid=Api&P=0&h=180" }, // Updated Noise Logo
//   { id: 10, name: "Fastrack", logo: "https://i.pinimg.com/736x/a2/e5/56/a2e556a77c2a4ca3f015be2bd7215672.jpg" },
//   { id: 11, name: "Sonata", logo: "https://tse4.mm.bing.net/th?id=OIP.VApAwOIzbNtLrXrTRSQ7JgAAAA&pid=Api&P=0&h=180" },

];
  
  
  const Logo = () => {
    return (
      <section className="top-brands">
        <h2>Top Brands</h2>
        <div className="brand-grid">
          {brands.map((brand) => (
            <div key={brand.id} className="brand-card">
              <img src={brand.logo} alt={brand.name} />
            </div>
          ))}
        </div>
      </section>
    );
  };

export default Logo;

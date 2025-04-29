import React from "react";
import { Link } from "react-router-dom";
import "./category.css";

const categories = [
  { id: 1, name: "Sofas Sets", image: "https://cdn-icons-png.flaticon.com/128/13714/13714668.png", link: "/products/Sofa" },
  { id: 2, name: "Bean Bags", image: "https://cdn-icons-png.flaticon.com/128/1698/1698755.png", link: "/products/BeanBags" },
  { id: 3, name: "Chairs", image: "https://cdn-icons-png.flaticon.com/128/2271/2271438.png", link: "/products/Chair" },
  { id: 4, name: "Shoe Racks", image: "https://cdn-icons-png.flaticon.com/128/8653/8653764.png", link: "/products/Shoe" },
  { id: 5, name: "Bedroom Sets", image: "https://cdn-icons-png.flaticon.com/128/15938/15938667.png", link: "/products/Bedroom" },
  { id: 6, name: "Dining Sets", image: "https://cdn-icons-png.flaticon.com/128/13715/13715099.png", link: "/products/Dining" },
  { id: 7, name: "Study Tables", image: "https://cdn-icons-png.flaticon.com/128/3273/3273259.png", link: "/products/Table" },
  { id: 8, name: "Wardrobes", image: "https://cdn-icons-png.flaticon.com/128/1237/1237773.png", link: "/products/Wardrobes" },
  { id: 9, name: "Book Shelfs", image: "https://cdn-icons-png.flaticon.com/128/2570/2570015.png", link: "/products/Book" },
];

const CategoryButtons = () => {
  return (
    <div className="category-container">
      <h2>Shop by Categories</h2>
      <div className="category-grid">
        {categories.map((category) => (
          <Link to={category.link} key={category.id} className="category-button">
            <img src={category.image} alt={category.name} />
            <span>{category.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryButtons;




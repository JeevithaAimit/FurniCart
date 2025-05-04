import React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import { FaShoppingCart, FaHeart, FaStar, FaRegStar } from "react-icons/fa";
import "./topselling.css";

const BASE_URL = "http://localhost:5000";

const TopSelling = () => {
  const [recentProducts, setRecentProducts] = useState([]);
  const [favorites, setFavorites] = useState(new Set());

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/products/recent`);
        setRecentProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  const toggleFavorite = (productId) => {
    setFavorites((prevFavorites) => {
      const newFavorites = new Set(prevFavorites);
      newFavorites.has(productId) ? newFavorites.delete(productId) : newFavorites.add(productId);
      return newFavorites;
    });
  };

  const handleViewProduct = (product) => {
    navigate(`/product/${product._id}`, { state: { product } });
  };

  return (
    <section className="recent-products">
      <h2>Recently Added Products</h2>
      <div className="product-grid">
        {recentProducts.length > 0 ? (
          recentProducts.slice(0, 10).map((product) => (
            <div
              key={product._id}
              className="product-card"
              onClick={() => handleViewProduct(product)}
            >
              <button
                className="favorite-button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(product._id);
                }}
              >
                <FaHeart
                  className="heart-icon"
                  color={favorites.has(product._id) ? "red" : "#ccc"}
                />
              </button>

              <img
                src={
                  product.mainImage ||
                  "https://res.cloudinary.com/demo/image/upload/v1624367890/default-placeholder.png"
                }
                alt={product.name}
                className="product-image"
                onError={(e) => {
                  e.target.src =
                    "https://res.cloudinary.com/demo/image/upload/v1624367890/default-placeholder.png";
                }}
              />

              <h3 className="product-name">{product.name}</h3>

              <div className="price">
                {product.discountPrice ? (
                  <>
                    <span className="original-price">₹{product.price}</span>
                    <span className="discount-price">₹{product.discountPrice}</span>
                  </>
                ) : (
                  <span>₹{product.price}</span>
                )}
              </div>

              <div className="rating">
                {Array.from({ length: 5 }, (_, i) =>
                  i < (product.rating || 4) ? (
                    <FaStar key={i} className="star filled" />
                  ) : (
                    <FaRegStar key={i} className="star" />
                  )
                )}
              </div>

              <button
                className="add-to-cart"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewProduct(product);
                }}
              >
                <FaShoppingCart /> Add to Cart
              </button>
            </div>
          ))
        ) : (
          <p>No products available</p> // Display a message if no products are found
        )}
      </div>
    </section>
  );
};

export default TopSelling;

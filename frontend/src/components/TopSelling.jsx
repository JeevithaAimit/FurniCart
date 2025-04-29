import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaShoppingCart, FaHeart, FaTimes, FaStar, FaRegStar } from "react-icons/fa";
import "./topselling.css";

const BASE_URL = "http://localhost:5000"; // Change this if needed

const TopSelling = () => {
  const [recentProducts, setRecentProducts] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [selectedProduct, setSelectedProduct] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/products/recent`);
        console.log("Fetched products:", response.data);
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

  const openModal = (product) => setSelectedProduct(product);
  const closeModal = () => setSelectedProduct(null);

  const handleViewProduct = (product) => {
    navigate(`/product/${product._id}`, { state: { product } });
  };

  return (
    <section className="recent-products">
      <h2>Recently Added Products</h2>
      <div className="product-grid">
        {recentProducts.map((product) => (
          <div key={product._id} className="product-card" onClick={() => openModal(product)}>
            <button
              className="favorite-button"
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(product._id);
              }}
            >
              <FaHeart className="heart-icon" color={favorites.has(product._id) ? "red" : "#ccc"} />
            </button>

            <img
              src={product.mainImage || "https://res.cloudinary.com/demo/image/upload/v1624367890/default-placeholder.png"}
              alt={product.name}
              className="product-image"
              onError={(e) => {
                console.error(`Image not found: ${product.mainImage}`);
                e.target.src = "https://res.cloudinary.com/demo/image/upload/v1624367890/default-placeholder.png";
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

              {/* Star Rating System */}
              <div className="rating">
              {Array.from({ length: 5 }, (_, i) => (
                i < (product.rating || 4) ? <FaStar key={i} className="star filled" /> : <FaRegStar key={i} className="star" />
              ))}
            </div>
            
            <p className="product-description">{product.description.slice(0, 50)}...</p>
            
            <button className="add-to-cart" onClick={(e) => {
                e.stopPropagation();
                handleViewProduct(product);
              }}>
              <FaShoppingCart /> Add to Cart
            </button>
          </div>
        ))}
      </div>

      {selectedProduct && <ProductModal product={selectedProduct} onClose={closeModal} />}
    </section>
  );
};

const ProductModal = ({ product, onClose }) => {
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [isZooming, setIsZooming] = useState(false);

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPosition({ x, y });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal" onClick={onClose}>
          <FaTimes />
        </button>
        <div className="modal-body">
          <div
            className="image-container"
            onMouseEnter={() => setIsZooming(true)}
            onMouseLeave={() => setIsZooming(false)}
            onMouseMove={handleMouseMove}
          >
            <img
              src={product.mainImage}
              alt={product.name}
              className="modal-image"
              onError={(e) => {
                console.error(`Modal Image not found: ${product.mainImage}`);
                e.target.src = "/placeholder.jpg";
              }}
            />
          </div>
          {isZooming && (
            <div
              className="zoom-preview"
              style={{
                backgroundImage: `url(${product.mainImage})`,
                backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
              }}
            ></div>
          )}
          <div className="modal-details">
            <h2>{product.name}</h2>

            {/* Star Rating in Modal */}
            <div className="rating">
              {Array.from({ length: 5 }, (_, i) => (
                i < (product.rating || 4) ? <FaStar key={i} className="star filled" /> : <FaRegStar key={i} className="star" />
              ))}
            </div>

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
            <h3>Description</h3>
            <p>{product.description}</p>

            
            <button className="add-to-cart">
              <FaShoppingCart /> Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopSelling;

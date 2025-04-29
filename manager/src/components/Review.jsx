import React, { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import "./review.css";

const Reviews = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");


  // Fetch products
  useEffect(() => {
    axios
      .get("http://localhost:8000/api/products/all")
      .then((res) => {
        setProducts(res.data);
        const uniqueCats = ["All", ...new Set(res.data.map((p) => p.category))];
        setCategories(uniqueCats);
      })
      .catch((err) => console.error("Product fetch error:", err));
  }, []);

  // Fetch reviews when a product is selected
  const handleProductClick = (product) => {
    setSelectedProduct(product);
    axios
      .get(`http://localhost:8000/api/reviews/product/${product._id}`)
      .then((res) => {
        setReviews(res.data);
        setShowModal(true);
      })
      .catch((err) => console.error("Review fetch error:", err));
  };

  // Filter products based on selected category
  const filteredProducts =
    activeCategory === "All"
      ? products
      : products.filter((p) => p.category === activeCategory);
      const searchedProducts = filteredProducts.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

  // Calculate review stats
  const goodReviews = reviews.filter((r) => r.rating >= 4).length;
  const badReviews = reviews.filter((r) => r.rating <= 2).length;
  const avgRating =
    reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1);

    

  return (
    <div className="manager-reviews-container">
      <h2>📝 Product Reviews</h2>
      <div className="search-bar">
  <input
    type="text"
    placeholder="🔍 Search product name..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
  />
</div>


      {/* Category Tabs */}
      <div className="category-tabs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setActiveCategory(cat);
              setSelectedProduct(null);
              setReviews([]);
              setShowModal(false);
            }}
            className={activeCategory === cat ? "active-tab" : ""}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Table */}
      <div className="product-table-wrapper">
        <table className="product-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Product Name</th>
            </tr>
          </thead>
          <tbody>
          {searchedProducts.map((product) => (
  <tr
    key={product._id}
    onClick={() => handleProductClick(product)}
    className="product-row"
  >
    <td>
      <img src={product.mainImage} alt={product.name} height="80" />
    </td>
    <td>{product.name}</td>
  </tr>
))}

          </tbody>
        </table>
      </div>

      {/* Review Modal */}
      {showModal && selectedProduct && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-button" onClick={() => setShowModal(false)}>×</button>
            <h3>🛒 Reviews for: {selectedProduct.name}</h3>

            {/* Review Summary Bar */}
            {reviews.length > 0 && (
              <div className="review-summary-bar">
                <span className="total">Total: {reviews.length}</span>
                <span className="good">Good: {goodReviews}</span>
                <span className="bad">Bad: {badReviews}</span>
                <span className="average">Avg: ⭐ {avgRating.toFixed(1)}</span>
              </div>
            )}

            {reviews.length === 0 ? (
              <p>No reviews yet.</p>
            ) : (
              <table className="review-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Rating</th>
                    <th>Date</th>
                    <th>Review</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((review) => (
                    <tr key={review._id}>
                      <td>{review.customerName}</td>
                      <td>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={star <= review.rating ? "star filled" : "star"}
                          >
                            ★
                          </span>
                        ))}
                      </td>
                      <td>{format(new Date(review.createdAt), "dd MMM yyyy, hh:mm a")}</td>
                      <td className="review-text">"{review.review}"</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reviews;

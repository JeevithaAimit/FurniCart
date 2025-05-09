
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import "./ProductDetails.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

import {
  faStar,
  faStarHalfAlt,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import ImgZoom from "react-img-zoom";
import { useCart } from "../components/CartContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { formatDistanceToNow } from "date-fns";
import RatingBars from "../components/RatingBars";



const ProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [product, setProduct] = useState(null);
  // ← track by index instead of URL
  const [imageIndex, setImageIndex] = useState(0);

  const [quantity, setQuantity] = useState(1);
  const [gstRate] = useState(18);
  const [rating, setRating] = useState(5);
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState("");
  const [showReviewPopup, setShowReviewPopup] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);

  // Fetch product & reviews
  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      try {
        const resp = await axios.get(
          `http://localhost:5000/products/${productId}`
        );
        setProduct(resp.data);
        setImageIndex(0); // ← reset to first image
      } catch (err) {
        console.error("Error fetching product:", err);
      }
    };

    const fetchReviews = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8500/api/reviews/product/${productId}`
        );
        setReviews(res.data);
      } catch (err) {
        console.error("Error fetching reviews:", err);
      }
    };

    fetchProduct();
    fetchReviews();
  }, [productId]);

  if (!product) return <h2>Loading...</h2>;

  // Build a flat array of all your images
  const images = [product.mainImage, ...(product.subImages || [])];
  const selectedImage = images[imageIndex];

  // Carousel handlers
  const handlePrevImage = () => {
    setImageIndex((i) => (i - 1 + images.length) % images.length);
  };
  const handleNextImage = () => {
    setImageIndex((i) => (i + 1) % images.length);
  };

  // Quantity
  const handleIncrease = () => {
    if (quantity < product.quantity) setQuantity((q) => q + 1);
    else toast.warn(`Only ${product.quantity} in stock.`);
  };
  const handleDecrease = () => {
    setQuantity((q) => Math.max(q - 1, 1));
  };

  const averageRating =
  reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  // Add to Cart
  const handleAddToCart = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user.id) {
      alert("Please log in to add items to your cart.");
      return;
    }
    if (quantity > product.quantity) {
      toast.error("Not enough stock.");
      return;
    }
    addToCart({ ...product, quantity });
    toast.success("Added to cart!");
  };

  // Submit Review
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user.id) {
      toast.error("Please log in to submit a review.");
      return;
    }
    try {
      await axios.post("http://localhost:8500/api/reviews/add", {
        productId: product._id,
        productName: product.name,
        category: product.category,
        customerId: user.id,
        customerName: user.name,
        review: reviewText,
        rating,
      });
      const purchaseRes = await axios.post(
        "http://localhost:8500/api/reviews/check-purchase",
        { customerId: user.id, productName: product.name }
      );
      if (purchaseRes.data.purchased) {
        toast.success("✅ Thank you for your review!");
        setHasPurchased(true);
      } else {
        toast.error("⚠️ Must purchase before reviewing.");
        setHasPurchased(false);
      }
      setReviewText("");
      setRating(5);
      setShowReviewPopup(true);
      // refresh reviews
      const res = await axios.get(
        `http://localhost:8500/api/reviews/product/${productId}`
      );
      setReviews(res.data);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error submitting review");
    }
  };

  // GST calculations
  const gstAmount = (product.discountPrice * gstRate) / 100;
  const finalPriceWithGst = product.discountPrice + gstAmount;

  return (
    <div className="product-details-container">
      {/* ========== IMAGES & CAROUSEL ========== */}
      <div className="product-images">
        <div className="zoom-container">
          <button
            className="carousel-arrow left"
            onClick={handlePrevImage}
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>

          <ImgZoom
            key={selectedImage}
            img={selectedImage}
            zoomScale={2}
            width={400}
            height={400}
          />

          <button
            className="carousel-arrow right"
            onClick={handleNextImage}
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>

        <div className="thumbnail-gallery">
          {images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`thumb-${idx}`}
              className={`thumbnail ${
                idx === imageIndex ? "active" : ""
              }`}
              onClick={() => setImageIndex(idx)}
            />
          ))}
        </div>

        {/* ========== REVIEW FORM ========== */}
        <div className="review-form">
          <h3>Leave a Review</h3>
          <div className="rating-stars-input">
            {[1, 2, 3, 4, 5].map((s) => (
              <span
                key={s}
                className={s <= rating ? "star selected" : "star"}
                onClick={() => setRating(s)}
              >
                ★
              </span>
            ))}
          </div>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Write your review…"
            rows={4}
          />
          <button onClick={handleReviewSubmit}>Submit Review</button>
        </div>

        {showReviewPopup && (
          <div className="popup-box">
            {hasPurchased ? (
              <>
                <p>✅ Thank you for your review!</p>
                <button onClick={() => setShowReviewPopup(false)}>
                  Close
                </button>
              </>
            ) : (
              <>
                <p>⚠️ You must purchase before reviewing.</p>
                <button onClick={() => navigate("/")}>
                  Continue Shopping
                </button>
                <button onClick={() => setShowReviewPopup(false)}>
                  Close
                </button>
              </>
            )}
          </div>
        )}

        {/* ========== ALL REVIEWS ========== */}
       {/* ========== ALL REVIEWS ========== */}
<div className="all-reviews">
  <h3>Customer Reviews</h3>

  {reviews.length > 0 && <RatingBars reviews={reviews} />}

  {reviews.filter((r) => r.status === "Ordered" || r.status === "Success").length === 0 ? (
    <p>No verified reviews yet.</p>
  ) : (
    <>
      {reviews
        .filter((r) => r.status === "Ordered" || r.status === "Success")
        .slice(0, showAllReviews ? reviews.length : 1)
        .map((rev, i) => (
          <div key={i} className="review-item">
            <div className="review-header">
              <strong>{rev.customerName}</strong>
              <div className="review-stars-time">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span key={s} className={s <= rev.rating ? "star filled" : "star"}>
                    ★
                  </span>
                ))}
              </div>
            </div>
            <p className="review-text">"{rev.review}"</p>
            <span className="review-time">
              {formatDistanceToNow(new Date(rev.createdAt), { addSuffix: true })}
            </span>
          </div>
        ))}

      {reviews.filter((r) => r.status === "Ordered" || r.status === "Success").length > 2 && (
      <button className="view-more-btn" onClick={() => setShowAllReviews(!showAllReviews)}>
          {showAllReviews ? (
            <>
              View Less <FontAwesomeIcon icon={faChevronUp} />
            </>
          ) : (
            <>
              View More <FontAwesomeIcon icon={faChevronDown} />
            </>
          )}
        </button>
      )}
    </>
  )}
</div>

      </div>
      {/* <div className="average-rating-circle">
  <CircularProgressbar
    value={averageRating * 20} // Convert rating (out of 5) to percentage
    text={`${averageRating.toFixed(1)}/5`}
    styles={buildStyles({
      textSize: '16px',
      pathColor: '#f39c12',
      textColor: '#333',
      trailColor: '#eee',
    })}
  />
  <p className="avg-label">Average Rating</p>
</div> */}


      {/* ========== PRODUCT INFO ========== */}
      <div className="product-info">
        <h1>{product.name}</h1>
        <h3 className="special-price">Special Price</h3>
        <h2 className="discount-price">
          ₹{product.discountPrice}
          <span className="actual-price"> ₹{product.price}</span>
          <span className="discount-percentage">
            (
            {Math.round(
              ((product.price - product.discountPrice) / product.price) * 100
            )}
            % OFF)
          </span>
        </h2>

        <div className="stars">
          {[...Array(4)].map((_, i) => (
            <FontAwesomeIcon
              key={i}
              icon={faStar}
              className="star-full-star"
            />
          ))}
          <FontAwesomeIcon
            icon={faStarHalfAlt}
            className="star-half-star"
          />
        </div>

        <h3 className="desc-heading">Description</h3>
        <p className="description">{product.description}</p>

        {product.type && product.color && product.material && (
          <div className="material-details">
            <div className="material-item">
              <strong>Type:</strong> <span>{product.type}</span>
            </div>
            <div className="material-item">
              <strong>Color:</strong> <span>{product.color}</span>
            </div>
            <div className="material-item">
              <strong>Material:</strong> <span>{product.material}</span>
            </div>
          </div>
        )}

        <div className="quantity-container">
          <label>
            <strong>Quantity:</strong>
          </label>
          <div className="quantity-selector">
            <button onClick={handleDecrease}>−</button>
            <span>{quantity}</span>
            <button onClick={handleIncrease}>+</button>
          </div>
        </div>

        <div className="stock-display">
          <strong>Available Stock:</strong>{" "}
          <span
            className={
              product.quantity < 5 ? "low-stock" : "normal-stock"
            }
          >
            {product.quantity}
          </span>
        </div>

        <div className="gst-price">
          <h3>GST ({gstRate}%): ₹{gstAmount.toFixed(2)}</h3>
          <h4>
            Final Price (incl. GST):{" "}
            <span>₹{finalPriceWithGst.toFixed(2)}</span>
          </h4>
        </div>

        {product.quantity === 0 ? (
          <button className="out-of-stock-btn" disabled>
            Out of Stock
          </button>
        ) : (
          <button
            onClick={handleAddToCart}
            className="add-to-cart-btn"
          >
            Add to Cart
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;

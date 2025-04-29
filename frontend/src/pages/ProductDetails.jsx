import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import "./ProductDetails.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faStarHalfAlt } from "@fortawesome/free-solid-svg-icons";
import ImgZoom from "react-img-zoom";
import { useCart } from "../components/CartContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { formatDistanceToNow } from "date-fns";
import RatingBars from "../components/RatingBars";

const ProductDetails = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [gstRate] = useState(18);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [rating, setRating] = useState(5);
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState("");
  const [showReviewPopup, setShowReviewPopup] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    const storedUser = JSON.parse(localStorage.getItem("user"));
  
    if (!storedUser || !storedUser.id) {
      toast.error("User not found. Please log in again.");
      return;
    }
  
    try {
      // First, submit the review.
      const addRes = await axios.post("http://localhost:8500/api/reviews/add", {
        productId: product._id,
        productName: product.name, // using product name for matching on backend
        category: product.category,
        customerId: storedUser.id,
        customerName: storedUser.name,
        review: reviewText,
        rating,
      });
  
      // You can log the response to see what status was returned.
      console.log("Add Review Response:", addRes.data);
  
      // Then, check the purchase status for extra verification if needed.
      const purchaseRes = await axios.post("http://localhost:8500/api/reviews/check-purchase", {
        customerId: storedUser.id,
        productName: product.name, // using product name for check
      });
  
      console.log("Check Purchase Response:", purchaseRes.data);
  
      if (purchaseRes.data.purchased) {
        toast.success("✅ Thank you for your review and for purchasing this product!");
        setHasPurchased(true);
      } else {
        toast.error("⚠️ You must purchase this product before submitting a review.");
        setHasPurchased(false);
      }
  
      // Clear the review form and refresh reviews.
      setReviewText("");
      setRating(0);
      fetchReviews();
  
      // Optionally, show a popup:
      setShowReviewPopup(true);
      
    } catch (error) {
      console.error("Review submission failed:", error);
      if (error.response?.data?.message) {
        toast.error("Error: " + error.response.data.message);
      } else if (error.message) {
        toast.error("Error: " + error.message);
      } else {
        toast.error("Something went wrong while submitting the review.");
      }
    }
  };
  


  const fetchReviews = async () => {
    try {
      const res = await axios.get(`http://localhost:8500/api/reviews/product/${productId}`);
      setReviews(res.data);
    } catch (error) {
      console.error("❌ Error fetching reviews:", error);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/products/${productId}`);
        setProduct(response.data);
        setSelectedImage(response.data.mainImage);
      } catch (error) {
        console.error("Error fetching product details:", error);
      }
    };

    if (productId) {
      fetchProduct();
      fetchReviews();
    }
  }, [productId]);

  if (!product) return <h2>Loading...</h2>;

  const handleIncrease = () => setQuantity((prev) => Math.min(prev + 1, 5));
  const handleDecrease = () => setQuantity((prev) => Math.max(prev - 1, 1));

  const gstAmount = (product.discountPrice * gstRate) / 100;
  const finalPriceWithGst = product.discountPrice + gstAmount;

  const handleAddToCart = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user?.id) {
      alert("Please log in to add items to your cart.");
      return;
    }
    if (!product) return;

    addToCart(product);
  };

  return (
    <div className="product-details-container">
      <div className="product-images">
        <div className="zoom-container">
          {selectedImage && (
            <ImgZoom key={selectedImage} img={selectedImage} zoomScale={2} width={400} height={400} />
          )}
        </div>
        <div className="thumbnail-gallery">
          <img
            src={product.mainImage}
            alt="Main"
            className={`thumbnail ${selectedImage === product.mainImage ? "active" : ""}`}
            onClick={() => setSelectedImage(product.mainImage)}
          />
          {Array.isArray(product.subImages) &&
            product.subImages.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Sub ${index + 1}`}
                className={`thumbnail ${selectedImage === img ? "active" : ""}`}
                onClick={() => setSelectedImage(img)}
              />
            ))}
        </div>

        {/* Review Form */}
        <div className="review-form">
          <h3>Leave a Review</h3>
          <div className="rating-stars-input">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={star <= rating ? "star selected" : "star"}
                onClick={() => setRating(star)}
              >
                ★
              </span>
            ))}
          </div>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Write your review here..."
            rows={4}
          />
          <button onClick={handleReviewSubmit}>Submit Review</button>
        </div>

        {/* Review Popup */}
        {showReviewPopup && (
          <div className="popup-box">
            {hasPurchased ? (
              <>
                <p>✅ Thank you for your review and for purchasing this product!</p>
                <button onClick={() => setShowReviewPopup()}>Close</button>
              </>
            ) : (
              <>
                <p>⚠️ You must purchase this product before submitting a review.</p>
                <button onClick={() => navigate("/")}>Continue Shopping</button>
                <button onClick={() => setShowReviewPopup(false)}>Close</button>
              </>
            )}
          </div>
        )}

        {/* All Reviews */}
        {/* All Reviews */}
<div className="all-reviews">
  <h3>Customer Reviews</h3>
  {reviews.filter((rev) => rev.status === "Ordered" || rev.status === "Success").length === 0 ? (
    <p>No verified reviews yet.</p>
  ) : (
    reviews
      .filter((rev) => rev.status === "Ordered" || rev.status === "Success")
      .map((rev, index) => (
        <div key={index} className="review-item">
          <div className="review-header">
            <strong>{rev.customerName}</strong>
            <div className="review-stars-time">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className={star <= rev.rating ? "star filled" : "star"}>
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
      ))
  )}
</div>

      </div>

      <div className="product-info">
        <h1>{product.name}</h1>
        <h3 className="special-price">Special Price</h3>
        <h2 className="discount-price">
          ₹{product.discountPrice}
          <span className="actual-price"> ₹{product.price}</span>
          <span className="discount-percentage">
            ({Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF)
          </span>
        </h2>
        <div className="rating-stars">
          {[...Array(4)].map((_, i) => (
            <FontAwesomeIcon key={i} icon={faStar} className="star full-star" />
          ))}
          <FontAwesomeIcon icon={faStarHalfAlt} className="star half-star" />
        </div>
        <h3 className="desc-heading">Description</h3>
        <p className="description">{product.description}</p>

        {product.color && product.type && product.material && (
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
          <div className="quantity-selector-group">
            <label>
              <strong>Quantity:</strong>
            </label>
            <div className="quantity-selector">
              <button onClick={handleDecrease}>−</button>
              <span>{quantity}</span>
              <button onClick={handleIncrease}>+</button>
            </div>
          </div>
        </div>

        <div className="stock-display">
          <strong>Available Stock : </strong>
          <span className={product.quantity < 5 ? "low-stock" : "normal-stock"}>
            {product.quantity}
          </span>
        </div>

        <div className="gst-price">
          <h3>GST ({gstRate}%): ₹{gstAmount.toFixed(2)}</h3>
          <h4>
            Final Price (incl. GST): <span>₹{finalPriceWithGst.toFixed(2)}</span>
          </h4>
        </div>

        {product.quantity === 0 ? (
          <button className="out-of-stock-btn" disabled>
            Out of Stock
          </button>
        ) : (
          <button onClick={handleAddToCart} className="add-to-cart-btn">
            Add to Cart
          </button>
        )}

        <br />
        <div className="rating-summary">
          <RatingBars reviews={reviews} />
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;


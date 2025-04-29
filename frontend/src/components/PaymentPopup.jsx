import React from "react";
import Modal from "react-modal";
import "./PaymentPopup.css"; // Import the CSS file
import { Link } from "react-router-dom";


Modal.setAppElement("#root");

const PaymentPopup = ({ isOpen, onClose }) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onRequestClose={onClose} 
      className="modal-content" 
      overlayClassName="modal-overlay"
    >
      <div className="popup-container">
        <div className="popup-icon">✅</div>
        <h2>Order Placed Successfully!</h2>
        <p>Your order has been placed successfully. Thank you for shopping with us! 🎉</p>

        <div className="button-group">
          <Link to="/Tracking" className="track-btn">
            Track Order
          </Link>
          <Link to="/" className="home-btn">
            Go to Home
          </Link>
        </div>
      </div>
    </Modal>
  );
};

export default PaymentPopup;

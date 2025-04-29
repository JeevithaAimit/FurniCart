import React from "react";
import "./RatingCircle.css";

const RatingCircle = ({ averageRating }) => {
  const strokeDasharray = 283;
  const strokeDashoffset = strokeDasharray - (averageRating / 5) * strokeDasharray;
  const isLow = averageRating <= 2;

  return (
    <div className="rating-circle">
      <svg width="100" height="100">
        <circle cx="50" cy="50" r="45" className="bg" />
        <circle
          cx="50"
          cy="50"
          r="45"
          className={`progress ${isLow ? "red" : "green"}`}
          style={{
            strokeDasharray,
            strokeDashoffset,
          }}
        />
        <text x="50" y="55" textAnchor="middle" className="text">
          {averageRating.toFixed(1)}★
        </text>
      </svg>
    </div>
  );
};

export default RatingCircle;

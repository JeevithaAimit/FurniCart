import React from "react";
import "./RatingBars.css";

const RatingBars = ({ reviews }) => {
  const counts = [0, 0, 0, 0, 0];

  reviews.forEach((r) => {
    if (r.rating >= 1 && r.rating <= 5) {
      counts[r.rating - 1]++;
    }
  });

  const maxCount = Math.max(...counts);

  return (
    <div className="rating-bars">
      {[5, 4, 3, 2, 1].map((star, idx) => {
        const count = counts[star - 1];
        const percent = (count / maxCount) * 100;

        return (
          <div key={star} className="bar-row">
            <span className="star-label">{star} ★</span>
            <div className="bar-container">
              <div
                className={`bar-fill ${star <= 2 ? "low" : "high"}`}
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="count">{count}</span>
          </div>
        );
      })}
    </div>
  );
};

export default RatingBars;

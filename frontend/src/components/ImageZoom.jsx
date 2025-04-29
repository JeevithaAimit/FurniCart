import React from "react";
import ReactImageMagnify from "react-image-magnify";
import "./ImageZoom.css"; // Custom styles for zoom

const ImageZoom = ({ imageUrl }) => {
  return (
    <div className="zoom-container">
      <ReactImageMagnify
        {...{
          smallImage: {
            alt: "Product Image",
            isFluidWidth: true,
            src: imageUrl,
          },
          largeImage: {
            src: imageUrl,
            width: 1200, // High-resolution image
            height: 1200,
          },
          enlargedImageContainerStyle: { background: "#fff", zIndex: 1000 },
          enlargedImagePosition: "over",
        }}
      />
    </div>
  );
};

export default ImageZoom;

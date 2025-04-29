import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.js";
import { CartProvider } from "./components/CartContext"; // ✅ Ensure correct path
import { ToastContainer } from "react-toastify";


const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  // <React.StrictMode>
    <CartProvider>
      <App />
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={true}
        pauseOnFocusLoss
        draggable
        pauseOnHover
       />
    </CartProvider>
  // </React.StrictMode>
);

import React, { useState, useEffect } from "react";
import "./Checkout.css";
import PaymentPopup from "../components/PaymentPopup";
import { useCart } from "../components/CartContext";
import { QRCodeSVG } from 'qrcode.react';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "axios"; // ✅ Make sure axios is imported


const CheckOut = () => {
  const [saveAddress, setSaveAddress] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [upiProvider, setUpiProvider] = useState("");
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const { cart } = useCart();
  const [subtotal, setSubtotal] = useState(0);
  const [gstAmount, setGstAmount] = useState(0);
  const [step, setStep] = useState(1);
  const [showQR, setShowQR] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [invoicePdfBlob, setInvoicePdfBlob] = React.useState(null);

  const user = JSON.parse(localStorage.getItem("user"));

  const customerId = user?.id; // ✅ FIXED: use `id` instead of `_id`
  console.log("🧑‍💼 Logged in user:", user);
  console.log("🆔 Customer ID:", customerId);






  // Removed duplicate declaration of formData


  const upiId = "yourupiid@upi";
  const upiLink = `upi://pay?pa=${upiId}&pn=FurniCart&am=${totalAmount}&cu=INR`;

  const [formData, setFormData] = React.useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    billingAddress: "",
    billingCity: "",
    billingState: "",
    billingCountry: "",
    billingZip: "",
    cardHolder: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    useBillingAsShipping: false,
    shippingAddress: "",
    shippingCity: "",
    shippingState: "",
    shippingCountry: "",
    shippingZip: "",
  });

  useEffect(() => {
    if (cart.length > 0) {
      const calculatedSubtotal = cart.reduce((acc, item) => {
        const itemTotal = (item.discountPrice || item.price || 0) * (item.quantity || 1);
        return acc + itemTotal;
      }, 0);

      const gstRate = 0.18;
      const calculatedGstAmount = calculatedSubtotal * gstRate;
      const calculatedTotalWithGST = calculatedSubtotal + calculatedGstAmount;

      setSubtotal(Number(calculatedSubtotal.toFixed(2)));
      setGstAmount(Number(calculatedGstAmount.toFixed(2)));
      setTotalAmount(Number(calculatedTotalWithGST.toFixed(2)));
    } else {
      setSubtotal("0.00");
      setGstAmount("0.00");
      setTotalAmount("0.00");
    }
  }, [cart]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (name === "useBillingAsShipping" && checked) {
      setFormData((prev) => ({
        ...prev,
        shippingAddress: prev.billingAddress,
        shippingCity: prev.billingCity,
        shippingState: prev.billingState,
        shippingCountry: prev.billingCountry,
        shippingZip: prev.billingZip,
      }));
    } else if (name === "useBillingAsShipping" && !checked) {
      setFormData((prev) => ({
        ...prev,
        shippingAddress: "",
        shippingCity: "",
        shippingState: "",
        shippingCountry: "",
        shippingZip: "",
      }));
    }
  };


  const handleSaveAddress = (e) => {
    setSaveAddress(e.target.checked);
  };

  const handleNext = () => {
    if (step === 1 && !isSubmitted) {
      alert("Please submit your address details before proceeding.");
      return;
    }
    setStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setStep((prevStep) => prevStep - 1);
  };

  const updateOrderTracking = async (orderId) => {
    try {
      const response = await fetch(`http://localhost:8500/api/orders/${orderId}/update-tracking`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Processing" }),
      });

      if (response.ok) {
        console.log("✅ Order tracking updated successfully.");
      } else {
        console.error("❌ Failed to update order tracking.");
      }
    } catch (error) {
      console.error("❌ Error updating order tracking:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.phone ||
      !formData.email ||
      !formData.billingAddress ||
      !formData.billingCity ||
      !formData.billingState ||
      !formData.billingCountry ||
      !formData.billingZip
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    const orderData = {
      customerId: customerId,
      name: formData.firstName + " " + formData.lastName,
      email: formData.email,
      phone: formData.phone,
      billingAddress: {
        address: formData.billingAddress,
        city: formData.billingCity,
        state: formData.billingState,
        country: formData.billingCountry,
        zipCode: formData.billingZip,
      },
      shippingAddress: {
        address: formData.shippingAddress,
        city: formData.shippingCity,
        state: formData.shippingState,
        country: formData.shippingCountry,
        zipCode: formData.shippingZip,
      },
      items: cart.map((item) => ({
        productId: item._id,
        productName: item.name,
        price: item.discountPrice,
        quantity: item.quantity,
        mainImage: item.image || "https://via.placeholder.com/100", // Bug Fix: Use item.image
        category: item.category
        ,
      })),
      totalPrice: totalAmount,
    };

    try {
      const response = await fetch("http://localhost:8500/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();
      if (response.ok) {
        setOrderId(data.order._id);
        alert(`✅ Order Placed Successfully!\n🆔 Order ID: ${data.order._id}`);
        setIsSubmitted(true);
      } else {
        alert(data.message || "Order placement failed!");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  const handlePaymentChange = (e) => {
    if (!e || !e.target) return;
    const selectedMethod = e.target.value;
    setPaymentMethod(selectedMethod);
    setShowQR(selectedMethod === "UPI");
  };

  const handlePaymentSubmit = async () => {
    console.log("🔍 Selected Payment Method:", paymentMethod);

    if (!paymentMethod) {
      alert("Please select a payment method.");
      return;
    }

    if (!orderId) {
      alert("❌ Order ID is missing. Please place an order first.");
      return;
    }

    const paymentDetails = {
      orderId,
      name: formData.firstName + " " + formData.lastName,
      email: formData.email,
      paymentMethod,
      amount: totalAmount,
      cardDetails: paymentMethod === "Credit Card" ? {
        cardHolder: formData.cardHolder,
        cardNumber: formData.cardNumber,
        expiryDate: formData.expiryDate,
        cvv: formData.cvv,
      } : null,
      upiDetails: paymentMethod === "UPI" ? {
        provider: upiProvider || "QR Scan",
        upiId: formData.upiId || "test@upi",
      } : null,
    };

    try {
      const response = await fetch("http://localhost:8500/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentDetails),
      });

      const data = await response.json();
      if (response.ok) {
        alert(`✅ Payment Successful using ${paymentMethod}!\n🆔 Order ID: ${orderId}`);
        updateOrderTracking(orderId);
        alert(`Payment Successful using ${paymentMethod}! Your order has been placed.`);
        setPopupOpen(true);
        setStep(3);
      } else {
        console.error("❌ Payment API Error:", data);
        alert(data.message || "Payment failed!");
      }
    } catch (error) {
      console.error("❌ Error processing payment:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  const sendInvoiceViaEmail = async () => {
    if (!invoicePdfBlob || !formData.email) {
      alert("Missing invoice or user email.");
      return;
    }

    const emailFormData = new FormData();
    emailFormData.append("invoice", invoicePdfBlob, "invoice.pdf");
    emailFormData.append("email", formData.email);

    try {
      const response = await axios.post("http://localhost:8500/api/send-invoice-email", emailFormData);
      if (response.data.success) {
        alert("✅ Invoice sent via Email!");
      } else {
        alert("❌ Failed to send invoice via Email.");
      }
    } catch (error) {
      console.error("Email send error:", error);
      alert("❌ Email sending failed.");
    }
  };



  const generatePDF = () => {
    const doc = new jsPDF();

    // Convert number to words
    const numberToWords = (num) => {
      const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
        'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
      const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
      const convert = (n) => {
        if (n < 20) return a[n];
        if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
        if (n < 1000) return a[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " and " + convert(n % 100) : "");
        if (n < 100000) return convert(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + convert(n % 1000) : "");
        return "Number too large";
      };
      return convert(Math.floor(num)) + ' Rupees Only';
    };

    const orderDate = new Date().toLocaleDateString();

    // Title
    autoTable(doc, {
      head: [['FurniCart']],
      theme: 'plain',
      styles: {
        fontStyle: 'bold',
        fontSize: 13,
        halign: 'center',
        textColor: [0, 0, 0],
      },
      margin: { top: 14 },
    });

    // Order ID and Date
    autoTable(doc, {
      body: [[`Order ID: ${orderId || 'N/A'}`, '', `Order Date: ${orderDate}`]],
      theme: 'plain',
      styles: {
        fontSize: 12,
        fontStyle: 'bold',
        textColor: [0, 0, 0]
      },
      columnStyles: {
        0: { halign: 'left' },
        2: { halign: 'right' }
      },
      startY: doc.lastAutoTable.finalY + 5
    });

    // Billing & Shipping Address
    const billing = `${formData.firstName} ${formData.lastName}\n${formData.billingAddress}, ${formData.billingCity}, ${formData.billingState}, ${formData.billingCountry} - ${formData.billingZip}`;
    const shipping = formData.useBillingAsShipping
      ? billing
      : `${formData.firstName} ${formData.lastName}\n${formData.shippingAddress}, ${formData.shippingCity}, ${formData.shippingState}, ${formData.shippingCountry} - ${formData.shippingZip}`;

    autoTable(doc, {
      head: [['Billing Address', 'Shipping Address']],
      body: [[billing, shipping]],
      startY: doc.lastAutoTable.finalY + 6,
      styles: {
        fontSize: 10,
        valign: 'top',
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.7
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 90 },
        1: { cellWidth: 90 }
      },
      theme: 'grid'
    });

    // Product Table
    autoTable(doc, {
      head: [["Sl.No", "Description", "Rate", "Qty", "GST", "Amount"]],
      body: cart.map((item, i) => {
        const price = item.discountPrice || item.price || 0;
        const tax = price * 0.18;
        const total = (price + tax) * item.quantity;
        return [
          i + 1,
          item.name,
          `RS:${price.toFixed(2)}`,
          item.quantity,
          "18%",
          `RS:${total.toFixed(2)}`
        ];
      }),
      startY: doc.lastAutoTable.finalY + 8,
      theme: 'grid',
      styles: {
        fontSize: 10,
        halign: 'center',
        cellPadding: 3,
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.7
      },
      columnStyles: {
        1: { halign: 'left' }
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        lineColor: [0, 0, 0],
        lineWidth: 0.7
      }
    });

    // Totals
    const subtotal = cart.reduce((sum, item) => sum + item.quantity * (item.discountPrice || item.price), 0);
    const gst = subtotal * 0.18;
    const total = subtotal + gst;

    autoTable(doc, {
      body: [
        ['Subtotal', `RS:${subtotal.toFixed(2)}`],
        ['GST (18%)', `RS:${gst.toFixed(2)}`],
        ['Total Amount', `RS:${total.toFixed(2)}`],
        ['Amount in Words', numberToWords(total)]
      ],
      theme: 'grid',
      margin: { top: 10, left: 105 },
      styles: {
        fontSize: 10,
        fontStyle: 'bold',
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.7
      },
      columnStyles: {
        0: { cellWidth: 45, halign: 'left' },
        1: { cellWidth: 50, halign: 'right' }
      }
    });

    // Payment Section
    autoTable(doc, {
      body: [
        [{ content: "Method", styles: { fontStyle: "bold" } }, `: ${paymentMethod || 'N/A'}`],
        [{ content: "Amount Paid", styles: { fontStyle: "bold" } }, `: RS:${totalAmount?.toFixed(2) || total.toFixed(2)}`]
      ],
      startY: doc.lastAutoTable.finalY + 8,
      styles: {
        fontSize: 10,
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.7
      },
      theme: 'grid',
      margin: { top: 8 },
      columnStyles: {
        0: { cellWidth: 45, halign: 'left' },
        1: { cellWidth: 100, halign: 'left' }
      }
    });

    // Thank You Note
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text("Thank you for shopping with us!", 14, doc.lastAutoTable.finalY + 10);

    // Signature Section
    const pageHeight = doc.internal.pageSize.height;
    const signatureY = pageHeight - 50;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text("Signature", 150, signatureY - 10, { align: 'center' });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("FurniCart", 150, signatureY + 10, { align: 'center' });

    const blob = doc.output("blob");
    setInvoicePdfBlob(blob);
    doc.save(`Invoice_${orderId || 'order'}.pdf`);
  };



  return (
    <div className="checkout-container">
      <div className="checkout-content">
        <div className="order-summary">
          <h2>Order Summary</h2>
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Product</th>
                <th>Category</th>
                <th>Qty</th>
                <th>Price (₹)</th>

              </tr>
            </thead>
            <tbody>
              {cart.map((item) => (
                <tr key={item.id}>
                  <td>
                    <img
                      src={item.image ?? "https://via.placeholder.com/100"}
                      alt={item.name || "Product Image"}
                      className="cart-item-image"
                    />

                  </td>
                  <td>{item.name}</td>
                  <td>{item.category}</td>
                  <td>{item.quantity}</td>
                  <td>{item.discountPrice ? item.discountPrice.toFixed(2) : "N/A"}</td>
                </tr>
              ))}
            </tbody>

          </table>
          <div className="totals">
            <h3>Subtotal: ₹{subtotal}</h3>
            <h3>GST (18%): ₹{gstAmount}</h3>
            <h2>Total: ₹{totalAmount}</h2>
          </div>
          <h1 className="place-order">
            <span className="arrow">↓</span>
          </h1>

        </div>

        <div className="checkout-details">
          <div className="stepper">
            <div className={`step ${step >= 1 ? "active" : ""}`}>1. Address</div>
            <div className={`step ${step >= 2 ? "active" : ""}`}>2. Payment</div>
            <div className={`step ${step === 3 ? "active" : ""}`}>3. Confirm Order</div>
          </div>

          {step === 1 && (
            <div className="checkout-box">
              <h2>Billing Address</h2>
              <div className="input-group">
                <input type="text" name="firstName" placeholder="First Name" onChange={handleChange} value={formData.firstName} required />
                <input type="text" name="lastName" placeholder="Last Name" onChange={handleChange} value={formData.lastName} required />
              </div>
              <input type="tel" name="phone" placeholder="Phone" onChange={handleChange} value={formData.phone} required />
              <input type="email" name="email" placeholder="Email" onChange={handleChange} value={formData.email} required />
              <input type="text" name="billingAddress" placeholder="Street Address" onChange={handleChange} value={formData.billingAddress} required />
              <div className="input-group">
                <input type="text" name="billingCity" placeholder="City" onChange={handleChange} value={formData.billingCity} required />
                <input type="text" name="billingState" placeholder="State" onChange={handleChange} value={formData.billingState} required />
                <input type="text" name="billingCountry" placeholder="Country" onChange={handleChange} value={formData.billingCountry} required />
                <input type="text" name="billingZip" placeholder="ZIP" onChange={handleChange} value={formData.billingZip} required />
              </div>
              {/* <label className="checkbox-label">
                <input type="checkbox" checked={saveAddress} onChange={handleSaveAddress} />
                Save this address for future
              </label> */}
              <label className="save">
                <input type="checkbox" className="saveCheckbox" name="useBillingAsShipping" onChange={handleChange} checked={formData.useBillingAsShipping} />
                Use billing address as shipping address
              </label>

              <h2>Shipping Address</h2>
              <input type="text" name="shippingAddress" placeholder="Street Address" onChange={handleChange} value={formData.shippingAddress} required disabled={formData.useBillingAsShipping} />
              <div className="input-group">
                <input type="text" name="shippingCity" placeholder="City" onChange={handleChange} value={formData.shippingCity} required disabled={formData.useBillingAsShipping} />
                <input type="text" name="shippingState" placeholder="State" onChange={handleChange} value={formData.shippingState} required disabled={formData.useBillingAsShipping} />
                <input type="text" name="shippingCountry" placeholder="Country" onChange={handleChange} value={formData.shippingCountry} required disabled={formData.useBillingAsShipping} />
                <input type="text" name="shippingZip" placeholder="ZIP" onChange={handleChange} value={formData.shippingZip} required disabled={formData.useBillingAsShipping} />
              </div>

              <div className="button-group">
                <button onClick={handleSubmit} className="submit-btn">Submit</button>
                <button onClick={handleNext} className="next-btn" disabled={!isSubmitted}>
                  Next
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="checkout-box">
              <h2>Payment Details</h2>
              <div className="payment-details">
                <div className="payment-option">
                  <input type="radio" value="Cash on Delivery" name="paymentMethod" onChange={handlePaymentChange} />
                  <label htmlFor="cod">Cash on Delivery</label>
                </div>

                <div className="payment-option">
                  <input type="radio" value="Credit Card" name="paymentMethod" onChange={handlePaymentChange} />
                  <label htmlFor="creditCard">Credit Card</label>
                </div>

                <div className="payment-option">
                  <input type="radio" value="UPI" name="paymentMethod" onChange={handlePaymentChange} />
                  {showQR && (
                    <>
                      <div className="qr-overlay" onClick={() => setShowQR(false)}></div>
                      <div className="qr-popup">
                        <h3>Scan QR Code to Pay</h3>
                        <QRCodeSVG value={upiLink} size={200} />
                        <button className="qr-close" onClick={() => setShowQR(false)}>Close</button>
                      </div>
                    </>
                  )}
                  <label htmlFor="upi">UPI</label>
                </div>
              </div>

              {paymentMethod === "Credit Card" && (
                <>
                  <input type="text" name="cardHolder" placeholder="Cardholder Name" onChange={handleChange} value={formData.cardHolder} required />
                  <input type="text" name="cardNumber" placeholder="Card Number" maxLength="16" onChange={handleChange} value={formData.cardNumber} required />
                  <input type="text" name="expiryDate" placeholder="Expiry Date (MM/YY)" maxLength="5" onChange={handleChange} value={formData.expiryDate} required />
                  <input type="text" name="cvv" placeholder="CVV" maxLength="3" onChange={handleChange} value={formData.cvv} required />
                </>
              )}

              <div className="button-group">
                <button onClick={handleBack} className="back-btn">Back</button>
                <button onClick={handlePaymentSubmit} className="submit-btn">Pay Now</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="checkout-box">
              <h2>Order Confirmation</h2>
              <p>Your order has been placed successfully! 🎉</p>
              {orderId && <p style={{ marginBottom: "10px" }}><strong>Order ID:</strong> {orderId}</p>}
              {orderId && (
                <div>
                  <button className="download-btn" onClick={generatePDF}>
                    ⬇️ Download Invoice
                  </button>
                  <button onClick={sendInvoiceViaEmail} className="btn-whatsapp">
                    📧 Share via Email
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        <PaymentPopup isOpen={isPopupOpen} onClose={() => setPopupOpen(false)} paymentMethod={paymentMethod} />
      </div>
    </div>
  );
};

export default CheckOut;

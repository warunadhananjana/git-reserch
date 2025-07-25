import React from "react";
import { CheckCircle, Printer, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ThankYouPage = () => {
  const navigate = useNavigate();
  const orderDetails = JSON.parse(localStorage.getItem("lastOrder") || "{}");
  const orderNumber = Math.random().toString(36).substring(2, 12).toUpperCase();

  const handlePrintOrder = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Thank You for Your Order!</h1>
        <p className="text-gray-600 mb-4">
          Order #{orderNumber} has been successfully placed
        </p>
        <p className="text-gray-600">
          A confirmation email has been sent to {orderDetails.email}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
        <div className="space-y-4">
          {orderDetails.cart?.map((item) => (
            <div key={item.id} className="flex items-center space-x-4">
              <img
                src={item.images[0]}
                alt={item.name}
                className="w-16 h-16 object-cover rounded"
              />
              <div className="flex-1">
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-gray-600">
                  Quantity: {item.quantity}
                  {item.size && <span> | Size: {item.size}</span>}
                </p>
              </div>
              <p className="font-semibold">
                Rs. {(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}

          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Subtotal</span>
              <span>Rs. {orderDetails.subtotal?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Shipping</span>
              <span>Rs. {orderDetails.shipping?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Tax</span>
              <span>Rs. {orderDetails.tax?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>Rs. {orderDetails.total?.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Shipping Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-2">Delivery Address</h3>
            <p className="text-gray-600">
              {orderDetails.shippingAddress?.street}
              <br />
              {orderDetails.shippingAddress?.city},{" "}
              {orderDetails.shippingAddress?.state}{" "}
              {orderDetails.shippingAddress?.zip}
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Shipping Method</h3>
            <p className="text-gray-600">
              {orderDetails.shippingMethod === "express"
                ? "Express Shipping (2-3 business days)"
                : "Standard Shipping (4-5 business days)"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => navigate("/products")}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Continue Shopping</span>
        </button>
        <button
          onClick={handlePrintOrder}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
        >
          <Printer className="w-4 h-4" />
          <span>Print Order</span>
        </button>
      </div>
    </div>
  );
};

export default ThankYouPage;

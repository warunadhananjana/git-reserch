import React, { useState } from "react";
import { CreditCard, ShoppingBag, Truck } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

const CheckoutPage = () => {
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("credit");
  const { cart, clearCart } = useCart();
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = shippingMethod === "express" ? 20 : 10;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    street: "",
    apartment: "",
    city: "",
    state: "",
    zip: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (paymentMethod === "credit") {
      const cardNumber = e.target.cardNumber.value;
      const expiry = e.target.expiry.value;
      const cvv = e.target.cvv.value;
      const cardholderName = e.target.cardholderName.value;

      const cardErrors = validateCard(cardNumber, expiry, cvv, cardholderName);

      if (Object.keys(cardErrors).length > 0) {
        setErrors(cardErrors);
        const firstErrorField = document.querySelector(
          `[name="${Object.keys(cardErrors)[0]}"]`
        );
        firstErrorField?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        return;
      }
    }

    setErrors({});

    const orderDetails = {
      cart,
      subtotal,
      shipping,
      tax,
      total,
      email: formData.email,
      shippingAddress: {
        street: formData.street,
        apartment: formData.apartment,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
      },
      shippingMethod,
      customerInfo: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
      },
    };

    localStorage.setItem("lastOrder", JSON.stringify(orderDetails));

    clearCart();

    navigate("/thank-you");
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <button
          onClick={() => window.history.back()}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Return to Shopping
        </button>
      </div>
    );
  }

  const validateCard = (cardNumber, expiry, cvv, cardholderName) => {
    const errors = {};

    const isValidLuhn = (number) => {
      const digits = number.replace(/\D/g, "");
      let sum = 0;
      let isEven = false;

      for (let i = digits.length - 1; i >= 0; i--) {
        let digit = parseInt(digits[i]);

        if (isEven) {
          digit *= 2;
          if (digit > 9) {
            digit -= 9;
          }
        }

        sum += digit;
        isEven = !isEven;
      }

      return sum % 10 === 0;
    };

    if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, ""))) {
      errors.cardNumber = "Please enter a valid 16-digit card number";
    } else if (!isValidLuhn(cardNumber)) {
      errors.cardNumber = "Invalid card number";
    }

    const currentDate = new Date();
    const [expMonth, expYear] = expiry
      .split("/")
      .map((num) => parseInt(num.trim()));
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;

    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      errors.expiry = "Use MM/YY format";
    } else if (expMonth < 1 || expMonth > 12) {
      errors.expiry = "Invalid month";
    } else if (
      expYear < currentYear ||
      (expYear === currentYear && expMonth < currentMonth)
    ) {
      errors.expiry = "Card has expired";
    }

    if (!/^\d{3,4}$/.test(cvv)) {
      errors.cvv = "CVV must be 3 or 4 digits";
    }

    if (!cardholderName.trim()) {
      errors.cardholderName = "Name on card is required";
    } else if (cardholderName.trim().length < 2) {
      errors.cardholderName = "Please enter a valid name";
    }

    return errors;
  };

  const renderCreditCardForm = () => (
    <div className="space-y-4">
      <div className="space-y-4 p-4 border rounded-lg">
        <div>
          <input
            type="text"
            name="cardNumber"
            placeholder="Card Number"
            required
            maxLength="19"
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.cardNumber ? "border-red-500" : ""
            }`}
            onChange={(e) => {
              let value = e.target.value.replace(/\D/g, "");
              value = value.replace(/(\d{4})/g, "$1 ").trim();
              e.target.value = value;
            }}
          />
          {errors.cardNumber && (
            <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <input
              type="text"
              name="expiry"
              placeholder="MM/YY"
              required
              maxLength="5"
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.expiry ? "border-red-500" : ""
              }`}
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, "");
                if (value.length >= 2) {
                  value = value.slice(0, 2) + "/" + value.slice(2);
                }
                e.target.value = value;
              }}
            />
            {errors.expiry && (
              <p className="text-red-500 text-sm mt-1">{errors.expiry}</p>
            )}
          </div>

          <div>
            <input
              type="text"
              name="cvv"
              placeholder="CVV"
              required
              maxLength="4"
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.cvv ? "border-red-500" : ""
              }`}
              onChange={(e) => {
                e.target.value = e.target.value.replace(/\D/g, "");
              }}
            />
            {errors.cvv && (
              <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>
            )}
          </div>

          <div>
            <input
              type="text"
              name="cardholderName"
              placeholder="Name on Card"
              required
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.cardholderName ? "border-red-500" : ""
              }`}
            />
            {errors.cardholderName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.cardholderName}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Contact Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                required
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleInputChange}
              required
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Shipping Address</h2>
            <input
              type="text"
              name="street"
              placeholder="Street Address"
              value={formData.street}
              onChange={handleInputChange}
              required
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="text"
              name="apartment"
              placeholder="Apartment, suite, etc. (optional)"
              value={formData.apartment}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="grid grid-cols-3 gap-4">
              <input
                type="text"
                name="city"
                placeholder="City"
                required
                value={formData.city}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="text"
                name="state"
                placeholder="State"
                required
                value={formData.state}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="text"
                name="zip"
                placeholder="ZIP Code"
                required
                value={formData.zip}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Shipping Method</h2>
            <div className="space-y-2">
              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="shipping"
                  value="standard"
                  checked={shippingMethod === "standard"}
                  onChange={(e) => setShippingMethod(e.target.value)}
                  className="mr-4"
                />
                <div className="flex-1">
                  <div className="font-semibold">Standard Shipping</div>
                  <div className="text-sm text-gray-600">4-5 business days</div>
                </div>
                <div className="font-semibold">Rs. 10.00</div>
              </label>

              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="shipping"
                  value="express"
                  checked={shippingMethod === "express"}
                  onChange={(e) => setShippingMethod(e.target.value)}
                  className="mr-4"
                />
                <div className="flex-1">
                  <div className="font-semibold">Express Shipping</div>
                  <div className="text-sm text-gray-600">2-3 business days</div>
                </div>
                <div className="font-semibold">Rs. 20.00</div>
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Payment Method</h2>
            <div className="space-y-4">
              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="payment"
                  value="credit"
                  checked={paymentMethod === "credit"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-4"
                />
                <CreditCard className="w-6 h-6 mr-4" />
                <span className="font-semibold">Credit Card</span>
              </label>

              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-4"
                />
                <Truck className="w-6 h-6 mr-4" />
                <span className="font-semibold">Cash on Delivery</span>
              </label>

              {paymentMethod === "credit" && renderCreditCardForm()}

              {paymentMethod === "cod" && (
                <div className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-start space-x-2">
                    <div className="text-sm text-gray-600">
                      <p className="font-semibold mb-2">
                        Cash on Delivery Terms:
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>
                          Payment will be collected at the time of delivery
                        </li>
                        <li>Please keep exact change ready if possible</li>
                        <li>Cash and UPI payments accepted</li>
                        <li>Additional fee of Rs. 50 applies for COD orders</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="border rounded-lg p-6 space-y-6 sticky top-28">
            <h2 className="text-xl font-semibold">Order Summary</h2>

            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex space-x-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden">
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <div className="text-sm text-gray-600">
                      Quantity: {item.quantity}
                      {item.size && <span> | Size: {item.size}</span>}
                    </div>
                    <div className="font-semibold">Rs. {item.price}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>Rs. {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Rs. {shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>Rs. {tax.toFixed(2)}</span>
              </div>
              {paymentMethod === "cod" && (
                <div className="flex justify-between text-gray-600">
                  <span>COD Fee</span>
                  <span>Rs. 50.00</span>
                </div>
              )}
              <div className="h-px bg-gray-200 my-2" />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>
                  Rs. {(total + (paymentMethod === "cod" ? 50 : 0)).toFixed(2)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Place Order</span>
            </button>

            <p className="text-sm text-gray-600 text-center">
              {paymentMethod === "credit"
                ? "Your payment information is encrypted and secure"
                : "Payment will be collected upon delivery"}
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;

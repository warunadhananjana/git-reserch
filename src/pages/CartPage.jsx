import React from "react";
import { Trash2, Plus, Minus, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const CartPage = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, getCartTotal } = useCart();

  const getAvailableStock = (item) => {
    return item.variation ? item.variation.stock : item.base_stock;
  };

  const isAtStockLimit = (item) => {
    const availableStock = getAvailableStock(item);
    return item.quantity >= availableStock;
  };

  const handleUpdateQuantity = (item, change) => {
    const availableStock = getAvailableStock(item);
    const newQuantity = item.quantity + change;

    if (newQuantity <= 0) return;
    if (newQuantity > availableStock) return;

    updateQuantity(item.id, newQuantity, item.variation);
  };

  const handleRemoveFromCart = (item) => {
    removeFromCart(item.id, item.variation);
  };

  const subtotal = getCartTotal();
  const shipping = 10;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  const hasStockWarnings = cart.some((item) => isAtStockLimit(item));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Shopping Cart</h1>

      {cart.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Your cart is empty</p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {hasStockWarnings && (
              <div className="flex items-center bg-amber-50 text-amber-600 p-4 rounded-lg mb-4">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span>
                  Some items in your cart have reached their stock limit
                </span>
              </div>
            )}

            {cart?.map((item) => {
              const availableStock = getAvailableStock(item);
              const isAtLimit = isAtStockLimit(item);
              const remainingStock = Math.max(
                0,
                availableStock - item.quantity
              );

              return (
                <div
                  key={`${item?.id}-${item?.variation?.id || "base"}`}
                  className="flex space-x-4 border rounded-lg p-4"
                >
                  <div className="w-24 h-24 rounded-lg overflow-hidden">
                    <img
                      src={item?.images[0]}
                      alt={item?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between">
                      <h3 className="font-semibold">{item.name}</h3>
                      <button
                        onClick={() => handleRemoveFromCart(item)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    {item.variation && (
                      <div className="text-gray-600">
                        Variation: {item.variation.variation}
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleUpdateQuantity(item, -1)}
                            disabled={item.quantity <= 1}
                            className="p-1 rounded-md border hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item, 1)}
                            disabled={isAtLimit}
                            className="p-1 rounded-md border hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        {isAtLimit && (
                          <div className="text-sm text-amber-600">
                            Max quantity reached
                          </div>
                        )}
                        <div className="text-sm text-gray-500">
                          {remainingStock} units available
                        </div>
                      </div>
                      <div className="font-semibold">
                        Rs. {(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-1">
            <div className="border rounded-lg p-6 space-y-4 sticky top-4">
              <h2 className="text-xl font-bold">Order Summary</h2>

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
                <div className="h-px bg-gray-200 my-2" />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>Rs. {total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => navigate("/checkout")}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;

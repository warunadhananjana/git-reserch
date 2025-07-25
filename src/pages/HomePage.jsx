import React, { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { productService } from "../services/api";
import ProductCard from "../components/Product/ProductCard";

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState("");
  const [subscribeLoading, setSubscribeLoading] = useState(false);
  const [subscribeMessage, setSubscribeMessage] = useState(null);
  const safeJSONParse = (jsonString, fallback = {}) => {
    try {
      return JSON.parse(jsonString);
    } catch (err) {
      console.error("Error parsing JSON:", err);
      return fallback;
    }
  };

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      setLoading(true);
      try {
        const data = await productService.getAllProducts();
        const processedProducts = data
          .filter((product) => product)
          .map((product) => ({
            ...product,
            specs: safeJSONParse(product.specs),
            images: safeJSONParse(product.images),
            rating: parseFloat(product.rating),
            base_price: parseFloat(product.base_price),
          }))
          .slice(0, 12);
        setFeaturedProducts(processedProducts);
        setError(null);
      } catch (err) {
        setError("Failed to load featured products. Please try again later.");
        console.error("Error fetching featured products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setSubscribeLoading(true);
    setSubscribeMessage(null);

    try {
      await productService.subscribeNewsletter(email);
      setSubscribeMessage({
        type: "success",
        text: "Successfully subscribed to newsletter!",
      });
      setEmail("");
    } catch (err) {
      setSubscribeMessage({
        type: "error",
        text: "Failed to subscribe. Please try again.",
      });
      console.error("Error subscribing to newsletter:", err);
    } finally {
      setSubscribeLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="relative h-96 bg-gray-900 rounded-xl overflow-hidden">
        <img
          src="/images/22.jpg"
          alt="Hero"
          className="w-full h-full object-cover opacity-75"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-4">Summer Sale</h1>
            <p className="text-xl mb-6">Up to 50% off on selected items</p>
            <button className="bg-blue-600 px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              Shop Now
            </button>
          </div>
        </div>
      </section>
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Featured Products</h2>
          <a
            href="/products"
            className="text-blue-600 hover:text-blue-700 flex items-center transition-colors"
          >
            View All <ChevronRight className="h-4 w-4 ml-1" />
          </a>
        </div>

        {error && (
          <div className="mb-6">
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))
            : featuredProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
        </div>
      </section>
      <section className="bg-gray-100 rounded-xl p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Subscribe to Our Newsletter</h2>
        <p className="text-gray-600 mb-6">
          Get updates about new products and special offers
        </p>
        <form onSubmit={handleSubscribe} className="max-w-md mx-auto">
          <div className="flex">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 rounded-l-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <button
              type="submit"
              disabled={subscribeLoading}
              className="bg-blue-600 text-white px-6 py-2 rounded-r-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {subscribeLoading ? "Subscribing..." : "Subscribe"}
            </button>
          </div>
          {subscribeMessage && (
            <p
              className={`mt-2 text-sm ${
                subscribeMessage.type === "success"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {subscribeMessage.text}
            </p>
          )}
        </form>
      </section>
    </div>
  );
};

export default HomePage;

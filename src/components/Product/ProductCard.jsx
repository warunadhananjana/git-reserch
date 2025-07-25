import React, { useState, useEffect } from "react";
import { Heart, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { productService } from "../../services/api";

const ProductCard = ({
  id,
  name,
  base_price,
  images,
  category,
  rating,
  base_stock,
  has_variations,
  variations = [],
  specs,
  description,
}) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [productData, setProductData] = useState(null);
  const parsedImages = typeof images === "string" ? JSON.parse(images) : images;
  const parsedSpecs = typeof specs === "string" ? JSON.parse(specs) : specs;
  const displayImage = parsedImages?.[0] || "/placeholder-image.jpg";
  const numericRating = parseFloat(rating);

  const priceRange =
    has_variations && variations.length > 0
      ? {
          min: Math.min(...variations.map((v) => parseFloat(v.price))),
          max: Math.max(...variations.map((v) => parseFloat(v.price))),
        }
      : { min: parseFloat(base_price), max: parseFloat(base_price) };

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const data = await productService.getProductById(id);
        setProductData(data);
        setError(null);
      } catch (err) {
        setError("Error loading product details");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  const checkStock = (product) => {
    if (product.has_variations) {
      return product.variations.every((v) => v.stock <= 0);
    }
    return product.base_stock <= 0;
  };

  const isOutOfStock = productData
    ? checkStock(productData)
    : checkStock({
        has_variations,
        variations,
        base_stock,
      });

  const handleAddToCart = async () => {
    if (!has_variations) {
      try {
        const freshProductData = await productService.getProductById(id);
        addToCart(freshProductData[0], 1);
        return true;
      } catch (err) {
        setError("Error adding to cart");
        console.error("Error:", err);
        return false;
      }
    }
    return false;
  };

  const handleShopNow = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (isOutOfStock) {
      return;
    }

    if (has_variations) {
      navigate(`/single-product/${id}`);
    } else {
      const success = await handleAddToCart();
      if (success) {
        navigate("/cart");
      }
    }
  };

  const handleCardClick = () => {
    navigate(`/single-product/${id}`);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 animate-pulse">
        <div className="h-48 bg-gray-200 rounded mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <p className="text-red-500 text-center">{error}</p>
      </div>
    );
  }

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col justify-between h-full cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="relative">
        <img
          src={displayImage}
          alt={name}
          className="w-full h-48 object-cover"
        />
        {isOutOfStock && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-sm">
            Out of Stock
          </div>
        )}
        <button
          className="absolute top-2 right-2 p-1.5 bg-white rounded-full hover:bg-gray-100"
          onClick={(e) => e.stopPropagation()}
          aria-label="Add to wishlist"
        >
          <Heart className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      <div className="p-4 flex-1">
        <div className="text-sm text-gray-500 mb-1">{category}</div>
        <h3 className="text-lg font-semibold mb-2 line-clamp-2">{name}</h3>

        <div className="flex items-center mb-2">
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              className={`text-sm ${
                i < numericRating ? "text-yellow-400" : "text-gray-300"
              }`}
            >
              ★
            </span>
          ))}
          <span className="text-sm text-gray-500 ml-1">({numericRating})</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xl font-bold">
            {priceRange.min === priceRange.max
              ? `Rs. ${priceRange.min}`
              : `Rs. ${priceRange.min} - ${priceRange.max}`}
          </span>
        </div>
      </div>

      <div className="flex justify-center m-4">
        <button
          onClick={handleShopNow}
          disabled={isOutOfStock}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            isOutOfStock
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          <ShoppingCart className="h-4 w-4" />
          {isOutOfStock
            ? "Out of Stock"
            : has_variations
            ? "View Options"
            : "Shop Now"}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;

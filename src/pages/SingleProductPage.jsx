import React, { useEffect, useMemo, useState } from "react";
import { Star, ShoppingCart } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { productService } from "../services/api";

const SingleProductPage = () => {
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { id } = useParams();
  const navigate = useNavigate();
  const { cart, addToCart, updateQuantity } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const data = await productService.getProductById(id);
        if (!data || !data[0]) throw new Error("Product not found");

        const productData = data[0];

        const specs =
          typeof productData.specs === "string"
            ? JSON.parse(productData.specs)
            : productData.specs;
        const images =
          typeof productData.images === "string"
            ? JSON.parse(productData.images)
            : productData.images;

        const processedData = {
          ...productData,
          specs,
          images,
          rating: parseFloat(productData.rating) || 0,
          base_price: parseFloat(productData.base_price) || 0,
          variations: productData.variations?.map((variation) => ({
            ...variation,
            price: parseFloat(variation.price) || 0,
          })),
        };

        setProduct(processedData);

        if (processedData.variations?.length > 0) {
          setSelectedVariation({
            ...processedData.variations[0],
            price: parseFloat(processedData.variations[0].price) || 0,
          });
        }
      } catch (err) {
        setError(err.message || "Error loading product details");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const currentCartItem = useMemo(() => {
    if (!product) return null;
    return cart.find(
      (item) =>
        item.id === product.id &&
        (product.has_variations
          ? item.variationId === selectedVariation?.id
          : true)
    );
  }, [cart, product, selectedVariation]);

  useEffect(() => {
    if (!product) return;
    setQuantity(currentCartItem?.quantity || 1);
  }, [currentCartItem, product]);

  const getCurrentPrice = () => {
    if (!product) return 0;
    const price = selectedVariation?.price || product.base_price;
    return parseFloat(price) || 0;
  };

  const getCurrentStock = () => {
    if (!product) return 0;
    return selectedVariation?.stock ?? product.base_stock ?? 0;
  };

  const isOutOfStock = getCurrentStock() <= 0;

  const handleQuantityChange = (newQuantity) => {
    if (!product || isOutOfStock) return;
    const maxStock = getCurrentStock();
    const updatedQuantity = Math.max(1, Math.min(newQuantity, maxStock));
    setQuantity(updatedQuantity);

    if (currentCartItem) {
      updateQuantity(
        product.id,
        updatedQuantity,
        selectedVariation?.id || null
      );
    }
  };

  const handleAddToCart = () => {
    if (!product || isOutOfStock) return;
    if (!currentCartItem) {
      addToCart(product, quantity, selectedVariation?.id || null);
    } else {
      updateQuantity(product.id, quantity, selectedVariation?.id || null);
    }
  };

  const handleVariationChange = (variation) => {
    setSelectedVariation({
      ...variation,
      price: parseFloat(variation.price) || 0,
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="aspect-square bg-gray-200 rounded-lg w-full" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-6 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-red-600 text-center">
            {error || "Product not found"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="aspect-square rounded-lg overflow-hidden">
            <img
              src={product.images[selectedImageIndex]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 ${
                    selectedImageIndex === idx
                      ? "border-blue-600"
                      : "border-gray-200"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} view ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <div className="flex items-center mt-2 space-x-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, idx) => (
                  <Star
                    key={idx}
                    className={`w-5 h-5 ${
                      idx < Math.floor(product.rating)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="ml-2 text-gray-600">({product.rating})</span>
              </div>
              <span className="text-gray-600">{product.category}</span>
            </div>
          </div>

          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold">
              Rs. {getCurrentPrice().toFixed(2)}
            </span>
            {getCurrentStock() > 0 && (
              <span className="text-sm text-gray-600">
                {getCurrentStock()} units available
              </span>
            )}
          </div>

          {product.variations?.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Storage Options</h3>
              <div className="flex flex-wrap gap-2">
                {product.variations.map((variation) => (
                  <button
                    key={variation.id}
                    onClick={() => handleVariationChange(variation)}
                    className={`px-4 py-2 rounded-lg border ${
                      selectedVariation?.id === variation.id
                        ? "border-blue-600 bg-blue-50 text-blue-600"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    {variation.variation}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h3 className="font-semibold">Quantity</h3>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleQuantityChange(quantity - 1)}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <button
                onClick={() => handleQuantityChange(quantity + 1)}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                disabled={quantity >= getCurrentStock()}
              >
                +
              </button>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleAddToCart}
              className="flex-1 px-6 py-3 rounded-lg flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isOutOfStock}
            >
              <ShoppingCart className="w-5 h-5" />
              <span>{isOutOfStock ? "Out of Stock" : "Add to Cart"}</span>
            </button>
            <button
              onClick={() => navigate("/cart")}
              className="px-6 py-3 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              View Cart
            </button>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Product Specifications</h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(product.specs).map(([key, value]) => (
                <div key={key} className="flex flex-col">
                  <dt className="text-gray-600">{key}</dt>
                  <dd className="font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          {product.description && (
            <div className="space-y-2">
              <h3 className="font-semibold">Description</h3>
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SingleProductPage;

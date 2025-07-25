import React, { useState, useEffect } from "react";
import ProductFilters from "../components/Filters/ProductFilters";
import ProductGrid from "../components/Product/ProductGrid";
import Pagination from "../components/Common/Pagination";
import { productService } from "../services/api";

const ProductListingPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const productsPerPage = 12;

  const safeJSONParse = (jsonString, fallback = {}) => {
    try {
      return JSON.parse(jsonString);
    } catch (err) {
      console.error("Error parsing JSON:", err);
      return fallback;
    }
  };

  const getProductPriceRange = (product) => {
    if (product.has_variations && product.variations.length > 0) {
      const prices = product.variations.map((v) => parseFloat(v.price));
      return {
        min: Math.min(...prices),
        max: Math.max(...prices),
      };
    }
    return {
      min: parseFloat(product.base_price),
      max: parseFloat(product.base_price),
    };
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await productService.getAllProducts();
        const processedProducts = data.map((product) => ({
          ...product,
          specs: safeJSONParse(product.specs),
          images: safeJSONParse(product.images),
          rating: parseFloat(product.rating),
          base_price: parseFloat(product.base_price),
        }));

        setProducts(processedProducts);
        setFilteredProducts(processedProducts);

        const uniqueCategories = [
          ...new Set(data.map((product) => product.category)),
        ];
        setCategories(uniqueCategories);
        if (data.length > 0) {
          const allPrices = data.flatMap((product) => {
            const { min, max } = getProductPriceRange(product);
            return [min, max];
          });

          setPriceRange({
            min: Math.floor(Math.min(...allPrices)),
            max: Math.ceil(Math.max(...allPrices)),
          });
        }

        setError(null);
      } catch (err) {
        setError("Failed to load products. Please try again later.");
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleFilterChange = (filters) => {
    setCurrentPage(1);

    try {
      let filtered = [...products];

      if (filters.category !== "all") {
        filtered = filtered.filter(
          (product) =>
            product.category.toLowerCase() === filters.category.toLowerCase()
        );
      }

      filtered = filtered.filter((product) => {
        const { min, max } = getProductPriceRange(product);
        return min <= filters.priceRange[1] && max >= filters.priceRange[0];
      });

      if (filters.rating > 0) {
        filtered = filtered.filter(
          (product) => Math.floor(product.rating) >= filters.rating
        );
      }

      switch (filters.sortBy) {
        case "priceLowToHigh":
          filtered.sort((a, b) => {
            const aPrice = getProductPriceRange(a).min;
            const bPrice = getProductPriceRange(b).min;
            return aPrice - bPrice;
          });
          break;
        case "priceHighToLow":
          filtered.sort((a, b) => {
            const aPrice = getProductPriceRange(a).max;
            const bPrice = getProductPriceRange(b).max;
            return bPrice - aPrice;
          });
          break;
        case "newest":
          filtered.sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          );
          break;
        case "popularity":
          filtered.sort((a, b) => b.rating - a.rating);
          break;
        default:
          break;
      }

      setFilteredProducts(filtered);
    } catch (err) {
      console.error("Error applying filters:", err);
      setError("Error applying filters. Please try again.");
    }
  };

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const handleRetry = () => {
    setError(null);
    setCurrentPage(1);
    window.location.reload();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Products</h1>
        <span className="text-gray-600">
          Showing {filteredProducts.length} products
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1">
          <ProductFilters
            categories={categories}
            priceRange={priceRange}
            onFilterChange={handleFilterChange}
            disabled={loading || !!error}
          />
        </aside>

        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex justify-center items-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    No products match your filters.
                  </p>
                </div>
              ) : (
                <>
                  <ProductGrid
                    products={currentProducts}
                    loading={loading}
                    error={error}
                  />
                  <div className="mt-8 flex justify-center">
                    <Pagination
                      currentPage={currentPage}
                      totalItems={filteredProducts.length}
                      itemsPerPage={productsPerPage}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductListingPage;

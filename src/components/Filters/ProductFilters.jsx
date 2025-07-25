import { useState } from "react";

const ProductFilters = ({ categories, priceRange, onFilterChange }) => {
  const [filters, setFilters] = useState({
    category: "all",
    priceRange: [priceRange.min, priceRange.max],
    rating: 0,
    sortBy: "popularity",
  });

  const handleFilterChange = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  return (
    <div className="space-y-6 p-4 bg-white rounded-lg shadow">
      <div>
        <h3 className="text-lg font-semibold mb-3">Sort By</h3>
        <select
          value={filters.sortBy}
          onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
          className="w-full p-2 border rounded-lg"
        >
          <option value="popularity">Popularity</option>
          <option value="priceLowToHigh">Price: Low to High</option>
          <option value="priceHighToLow">Price: High to Low</option>
          <option value="newest">Newest First</option>
        </select>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-3">Categories</h3>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="category"
              value="all"
              checked={filters.category === "all"}
              onChange={(e) => handleFilterChange({ category: e.target.value })}
              className="mr-2"
            />
            All Categories
          </label>
          {categories.map((category) => (
            <label key={category} className="flex items-center">
              <input
                type="radio"
                name="category"
                value={category}
                checked={filters.category === category}
                onChange={(e) =>
                  handleFilterChange({ category: e.target.value })
                }
                className="mr-2"
              />
              {category}
            </label>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-3">Rating</h3>
        <div className="space-y-2">
          {[0, 4, 3, 2, 1].map((rating) => (
            <label key={rating} className="flex items-center">
              <input
                type="radio"
                name="rating"
                value={rating}
                checked={filters.rating === rating}
                onChange={(e) => {
                  const newRating = parseInt(e.target.value);
                  handleFilterChange({ rating: newRating });
                }}
                className="mr-2"
              />
              {rating === 0 ? (
                "All Ratings"
              ) : (
                <span className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`text-sm ${
                        i < rating ? "text-yellow-400" : "text-gray-300"
                      }`}
                    >
                      ★
                    </span>
                  ))}
                  <span className="ml-2">& up</span>
                </span>
              )}
            </label>
          ))}
        </div>
      </div>
      <button
        onClick={() =>
          setFilters({
            category: "all",
            priceRange: [0, 1000],
            rating: 0,
            sortBy: "popularity",
          })
        }
        className="w-full py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
      >
        Clear All Filters
      </button>
    </div>
  );
};
export default ProductFilters;

import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Search } from "lucide-react";
import { useCart } from "../context/CartContext";

const MainLayout = () => {
  const { cart } = useCart();
  const navigate = useNavigate();

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      navigate(`/search?q=${e.target.value}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-gray-900">Uni-Cart</h1>
            </Link>

            {/* Search */}
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={handleSearch}
                />
                <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex items-center space-x-8">
            <Link to="/cart" className="relative">
                <ShoppingCart className="h-6 w-6 text-gray-600 hover:text-gray-900" />
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {cartItemCount}
                </span>
                </Link>
              <a href="/account">
                <User className="h-6 w-6 text-gray-600 hover:text-gray-900" />
              </a>
            </nav>
          </div>

          {/* Sub Header Menu */}
          <div className="py-2 border-t">
            <nav className="flex space-x-8">
              {["Products", "Categories", "About Us", "Contact Us", "More"].map(
                (pages) => (
                  <a
                    key={pages}
                    href={`/${pages.toLowerCase()}`}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    {pages}
                  </a>
                )
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">About Us</h3>
              <p className="text-gray-400">
                Your trusted source for quality products.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="/contact">Contact Us</a>
                </li>
                <li>
                  <a href="/shipping">Shipping Info</a>
                </li>
                <li>
                  <a href="/returns">Returns</a>
                </li>
                <li>
                  <a href="/faq">FAQ</a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="/products">All Products</a>
                </li>
                <li>
                  <a href="/deals">Deals</a>
                </li>
                <li>
                  <a href="/new">New Arrivals</a>
                </li>
                <li>
                  <a href="/trending">Trending</a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 rounded-l-lg text-gray-900"
                />
                <button className="bg-blue-600 px-4 py-2 rounded-r-lg hover:bg-blue-700">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;

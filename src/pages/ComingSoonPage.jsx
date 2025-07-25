import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const ComingSoonPage = () => {
  const [email, setEmail] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const currentPath = location.pathname.split("/")[1];
  const pageName = currentPath.charAt(0).toUpperCase() + currentPath.slice(1);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      alert("Thank you for subscribing! We will notify you when we launch.");
      setEmail("");
    }
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="space-y-6 max-w-lg">
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75"></div>
          <div className="relative bg-blue-500 rounded-full p-6">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-4xl font-bold text-gray-900">Coming Soon</h1>
        <p className="text-xl text-gray-600">
          Our {pageName} page is under construction. We're working hard to bring
          you something amazing!
        </p>

        <div className="pt-8">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </button>
        </div>
      </div>

      <div className="mt-16 space-y-4">
        <p className="text-sm text-gray-500">Want to know when we launch?</p>
        <form onSubmit={handleSubscribe} className="flex gap-4 justify-center">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            required
          />
          <button
            type="submit"
            className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Notify Me
          </button>
        </form>
      </div>
    </div>
  );
};

export default ComingSoonPage;

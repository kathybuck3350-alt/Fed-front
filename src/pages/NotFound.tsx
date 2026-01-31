import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center px-4">
        <h1 className="mb-4 text-6xl font-bold">
          <span className="text-[#652C8F]">40</span>
          <span className="text-[#FF6600]">4</span>
        </h1>
        <p className="mb-6 text-xl text-gray-600">Oops! Page not found</p>
        <a
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 bg-[#FF6600] hover:bg-[#E55A00] text-white font-semibold rounded-sm transition-colors"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;

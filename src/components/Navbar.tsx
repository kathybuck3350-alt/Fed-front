import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="h-1 bg-gradient-to-r from-[#652C8F] to-[#FF6600]" />
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/">
            <img
              src="/assets/fedex-logo.svg"
              alt="FedEx"
              className="h-10 md:h-12 w-auto object-contain"
            />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection("home")}
              className="text-sm font-medium text-gray-700 hover:text-[#652C8F] transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection("services")}
              className="text-sm font-medium text-gray-700 hover:text-[#652C8F] transition-colors"
            >
              Services
            </button>
            <button
              onClick={() => scrollToSection("pricing")}
              className="text-sm font-medium text-gray-700 hover:text-[#652C8F] transition-colors"
            >
              Pricing
            </button>
            <button
              onClick={() => scrollToSection("process")}
              className="text-sm font-medium text-gray-700 hover:text-[#652C8F] transition-colors"
            >
              Process
            </button>
            <button
              onClick={() => scrollToSection("about")}
              className="text-sm font-medium text-gray-700 hover:text-[#652C8F] transition-colors"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="text-sm font-medium text-gray-700 hover:text-[#652C8F] transition-colors"
            >
              Contact
            </button>
          </div>

          <Link to="/track">
            <Button className="bg-[#FF6600] hover:bg-[#E55A00] text-white font-semibold border-0 rounded-sm px-6">
              Track Shipment
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

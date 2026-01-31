import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const SecondNavbar = () => {
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

          <div className="flex items-center gap-2">
            <Link to="/">
              <Button variant="outline" className="rounded-sm font-medium">
                Home
              </Button>
            </Link>
            <Link to="/track">
              <Button className="bg-[#FF6600] hover:bg-[#E55A00] text-white font-semibold border-0 rounded-sm px-6">
                Track Shipment
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default SecondNavbar;

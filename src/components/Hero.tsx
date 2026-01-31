import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight } from "lucide-react";

const Hero = () => {
  const [trackingId, setTrackingId] = useState("");
  const navigate = useNavigate();

  const scrollToContact = () => {
    const element = document.getElementById("contact");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const id = trackingId.trim();
    if (id) {
      navigate(`/track?tracking=${encodeURIComponent(id)}`);
    }
  };

  return (
    <section id="home" className="relative min-h-[420px] md:min-h-[480px] flex items-center overflow-hidden">
      {/* Background image - FedEx aircraft */}
      <div className="absolute inset-0">
        <img
          src="/assets/fedex-aircraft.jpeg"
          alt="FedEx aircraft"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#652C8F]/90 via-[#652C8F]/80 to-[#652C8F]/60" />
      </div>

      <div className="container mx-auto px-4 relative z-10 py-12">
        <div className="max-w-3xl">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
            Track Your Shipment
          </h1>
          <p className="text-white/90 text-lg mb-8">
            Enter your tracking number to get real-time status updates
          </p>

          {/* FedEx-style tracking input */}
          <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3 max-w-2xl">
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="Enter tracking number (e.g., SCS-20251102-330)"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                className="h-14 px-4 text-base bg-white border-0 rounded-sm placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-[#FF6600]"
              />
            </div>
            <Button
              type="submit"
              className="h-14 px-8 bg-[#FF6600] hover:bg-[#E55A00] text-white font-semibold rounded-sm text-base whitespace-nowrap"
            >
              <Search className="mr-2 h-5 w-5" />
              Track
            </Button>
          </form>

          <div className="mt-8 flex flex-wrap gap-4">
            <button
              onClick={scrollToContact}
              className="inline-flex items-center text-white/90 hover:text-white font-medium transition-colors"
            >
              Get Quote <ArrowRight className="ml-1 h-4 w-4" />
            </button>
            <a
              href="#services"
              className="inline-flex items-center text-white/90 hover:text-white font-medium transition-colors"
            >
              Our Services
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

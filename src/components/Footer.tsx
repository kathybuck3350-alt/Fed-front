import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-[#652C8F] text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="mb-4">
              <img
                src="/assets/fedex-logo.svg"
                alt="FedEx"
                className="h-12 w-auto object-contain [filter:brightness(0)_invert(1)]"
              />
            </div>
            <p className="text-white/80 text-sm leading-relaxed">
              Professional customs clearance and shipping solutions for businesses worldwide.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-white/80 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/track" className="text-white/80 hover:text-white transition-colors">
                  Track Shipment
                </Link>
              </li>
              <li>
                <a href="/#contact" className="text-white/80 hover:text-white transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <Link to="/admin" className="text-white/80 hover:text-white transition-colors text-xs">
                  Admin Panel
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-white">Contact Info</h3>
            <ul className="space-y-2 text-sm text-white/80">
              <li>WhatsApp: +(940)399-3899</li>
              <li className="break-all">Email: fedexshipcenterchat@gmail.com</li>
              <li>5601 Mark IV Pkwy, Fort Worth, TX 76131, United States</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-8 text-center text-sm text-white/60">
          <p>&copy; {new Date().getFullYear()} FedEx. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

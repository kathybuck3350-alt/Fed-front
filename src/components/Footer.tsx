import { Link } from "react-router-dom";
import { Package } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Package className="h-8 w-8" />
              <span className="text-xl font-bold">FedEx Ship Center</span>
            </div>
            <p className="text-primary-foreground/80 text-sm">
              Professional customs clearance and shipping solutions for businesses worldwide.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-primary-foreground/80 hover:text-primary-foreground">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/track" className="text-primary-foreground/80 hover:text-primary-foreground">
                  Track Shipment
                </Link>
              </li>
              <li>
                <button
                  onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
                  className="text-primary-foreground/80 hover:text-primary-foreground"
                >
                  Contact
                </button>
              </li>
              <li>
                <Link to="/admin" className="text-primary-foreground/80 hover:text-primary-foreground text-xs">
                  Admin Panel
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contact Info</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>WhatsApp: +(940)399-3899</li>
              <li className="break-all">Email: fedexshipcenterchat@gmail.com</li>
              <li>5601 Mark IV Pkwy, Fort Worth, TX76131, United States</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-sm text-primary-foreground/60">
          <p>&copy; 2020 FedEx Ship Center. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

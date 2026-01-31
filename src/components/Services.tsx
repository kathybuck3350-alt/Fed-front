import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Package, Clock, Globe, Shield, HeadphonesIcon } from "lucide-react";

const services = [
  {
    icon: Shield,
    title: "Customs Clearance",
    description: "Expert handling of all customs documentation and compliance requirements for smooth clearance.",
  },
  {
    icon: Package,
    title: "Express Delivery",
    description: "Fast and reliable shipping services to get your goods to their destination on time.",
  },
  {
    icon: FileText,
    title: "Documentation",
    description: "Complete documentation support including invoices, permits, and regulatory paperwork.",
  },
  {
    icon: Globe,
    title: "International Shipping",
    description: "Worldwide shipping network covering all major trade routes and destinations.",
  },
  {
    icon: Shield,
    title: "Secure Handling",
    description: "State-of-the-art security measures to protect your valuable shipments.",
  },
  {
    icon: HeadphonesIcon,
    title: "24/7 Support",
    description: "Round-the-clock customer support to assist you whenever you need help.",
  },
];

const Services = () => {
  return (
    <section id="services" className="py-16 md:py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-12 max-w-6xl mx-auto">
          <div>
            <img
              src="/assets/agent-with-packages.jpg"
              alt="Agents with packages - professional shipping services"
              className="rounded-sm w-full h-64 object-cover shadow-lg"
            />
          </div>
          <div className="text-center lg:text-left">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            Our Services
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive customs clearance and shipping solutions tailored to your business needs
          </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <Card
              key={index}
              className="bg-white border-gray-200 hover:border-[#652C8F]/50 hover:shadow-lg transition-all duration-200 rounded-sm overflow-hidden group"
            >
              <div className="h-1 bg-gradient-to-r from-[#652C8F] to-[#FF6600] opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader>
                <div className="w-12 h-12 bg-[#652C8F] rounded flex items-center justify-center mb-2">
                  <service.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  {service.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {service.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;

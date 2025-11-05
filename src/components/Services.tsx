import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    <section id="services" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Services</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Comprehensive customs clearance and shipping solutions tailored to your business needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center mb-4">
                  <service.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle>{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{service.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;

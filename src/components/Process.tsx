import { Card, CardContent } from "@/components/ui/card";
import { FileCheck, Search, Package, Truck } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: FileCheck,
    title: "Submit Documents",
    description: "Provide your shipment details and required documentation through our secure portal.",
  },
  {
    number: "02",
    icon: Search,
    title: "Review & Validation",
    description: "Our experts review and validate all documentation for compliance and accuracy.",
  },
  {
    number: "03",
    icon: Package,
    title: "Customs Processing",
    description: "We handle all customs procedures and communications with authorities on your behalf.",
  },
  {
    number: "04",
    icon: Truck,
    title: "Delivery Coordination",
    description: "Once cleared, we coordinate final delivery to ensure your goods arrive safely.",
  },
];

const Process = () => {
  return (
    <section id="process" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Process</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A streamlined approach to customs clearance that saves you time and ensures compliance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <Card key={index} className="relative hover:shadow-lg transition-all duration-300">
              <CardContent className="pt-6">
                <div className="absolute -top-4 left-6 w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {step.number}
                </div>
                <div className="mt-4 mb-4">
                  <step.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Process;

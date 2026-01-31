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
    <section id="process" className="py-16 md:py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            Our Process
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            A streamlined approach to customs clearance that saves you time and ensures compliance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <Card
              key={index}
              className="relative bg-white border-gray-200 rounded-sm overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#652C8F] to-[#FF6600]" />
              <CardContent className="pt-6 pl-6">
                <div className="text-2xl font-bold text-[#652C8F]/30 mb-4">
                  {step.number}
                </div>
                <div className="w-12 h-12 bg-[#652C8F] rounded flex items-center justify-center mb-4">
                  <step.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Process;

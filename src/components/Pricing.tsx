import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

const pricingPlans = [
  {
    name: "Standard Clearance",
    price: "$9,500",
    description: "Perfect for regular shipments",
    features: [
      "Standard customs processing",
      "5-7 business days clearance",
      "Email support",
      "Basic documentation",
      "Standard tracking",
    ],
    popular: false,
  },
  {
    name: "Express Clearance",
    price: "$12,500",
    description: "Faster processing for urgent shipments",
    features: [
      "Priority customs processing",
      "2-3 business days clearance",
      "24/7 phone & email support",
      "Complete documentation service",
      "Real-time tracking",
      "Dedicated account manager",
    ],
    popular: true,
  },
  {
    name: "Premium Service",
    price: "$15,000",
    description: "VIP treatment for high-value cargo",
    features: [
      "Expedited customs processing",
      "1-2 business days clearance",
      "24/7 priority support",
      "Full documentation & compliance",
      "Advanced tracking & alerts",
      "Personal account manager",
      "Insurance coverage included",
      "White-glove delivery service",
    ],
    popular: false,
  },
];

const Pricing = () => {
  const scrollToContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="pricing" className="py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            Pricing Plans
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Choose the plan that best fits your shipping needs. All prices in USDT.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <Card
              key={index}
              className={`relative bg-white rounded-sm overflow-hidden ${
                plan.popular
                  ? "border-2 border-[#FF6600] shadow-lg scale-[1.02]"
                  : "border border-gray-200"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#FF6600]" />
              )}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FF6600] text-white px-4 py-1 rounded text-xs font-semibold">
                  Most Popular
                </div>
              )}
              <CardHeader className="text-center pb-6 pt-8">
                <CardTitle className="text-xl font-bold text-gray-900">
                  {plan.name}
                </CardTitle>
                <div className="mb-2">
                  <span className="text-3xl font-bold text-[#652C8F]">
                    {plan.price}
                  </span>
                  <span className="text-gray-500"> USDT</span>
                </div>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Check className="h-5 w-5 text-[#FF6600] shrink-0 mt-0.5" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full rounded-sm font-semibold ${
                    plan.popular
                      ? "bg-[#FF6600] hover:bg-[#E55A00] text-white"
                      : "bg-[#652C8F] hover:bg-[#5520a0] text-white"
                  }`}
                  onClick={scrollToContact}
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;

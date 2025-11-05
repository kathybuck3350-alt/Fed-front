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
  },
];

const Pricing = () => {
  const scrollToContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="pricing" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Pricing Plans</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that best fits your shipping needs. All prices in USDT.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <Card
              key={index}
              className={`relative hover:shadow-xl transition-all duration-300 ${
                plan.popular ? "border-primary border-2 scale-105" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-accent text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              )}
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-primary">{plan.price}</span>
                  <span className="text-muted-foreground"> USDT</span>
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
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

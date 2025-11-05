import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Import Manager, TechCorp",
    content: "FedEx Ship Center has been instrumental in streamlining our international shipping process. Their customs clearance service is top-notch, and we've never experienced any delays.",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "Logistics Director, Global Trade Inc",
    content: "The team's expertise in handling complex customs requirements is outstanding. They've saved us countless hours and helped us avoid costly mistakes. Highly recommend their premium service!",
    rating: 5,
  },
  {
    name: "Emma Rodriguez",
    role: "Supply Chain Manager, Retail Solutions",
    content: "Professional, reliable, and always available when we need them. Their 24/7 support has been a game-changer for our business. Worth every penny!",
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Clients Say</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Don't just take our word for it - hear from businesses who trust us with their shipments
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

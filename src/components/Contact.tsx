import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    shipmentValue: "",
    service: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    toast.success("Message sent! We'll get back to you soon.");
    setFormData({
      name: "",
      email: "",
      phone: "",
      shipmentValue: "",
      service: "",
      message: "",
    });
  };

  return (
    <section id="contact" className="py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            Get In Touch
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Ready to streamline your customs clearance? Our friendly team is here to help—contact us today for a free consultation
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <Card className="border-gray-200 rounded-sm overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-[#652C8F] to-[#FF6600]" />
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your full name"
                    required
                    className="rounded-sm border-gray-300"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your.email@example.com"
                    required
                    className="rounded-sm border-gray-300"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="rounded-sm border-gray-300"
                  />
                </div>

                <div>
                  <Label htmlFor="shipmentValue">Shipment Value (USDT)</Label>
                  <Input
                    id="shipmentValue"
                    value={formData.shipmentValue}
                    onChange={(e) => setFormData({ ...formData, shipmentValue: e.target.value })}
                    placeholder="e.g., 10000"
                    className="rounded-sm border-gray-300"
                  />
                </div>

                <div>
                  <Label htmlFor="service">Select Service</Label>
                  <Select value={formData.service} onValueChange={(value) => setFormData({ ...formData, service: value })}>
                    <SelectTrigger className="rounded-sm border-gray-300">
                      <SelectValue placeholder="Choose a service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard Clearance</SelectItem>
                      <SelectItem value="express">Express Clearance</SelectItem>
                      <SelectItem value="premium">Premium Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us about your shipping needs..."
                    rows={4}
                    required
                    className="rounded-sm border-gray-300"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#FF6600] hover:bg-[#E55A00] text-white font-semibold rounded-sm"
                >
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-gray-200 rounded-sm">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#652C8F] rounded flex items-center justify-center shrink-0">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-gray-900">WhatsApp</h3>
                    <p className="text-gray-600">+(940)399-3899</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 rounded-sm">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#FF6600] rounded flex items-center justify-center shrink-0">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-gray-900">Email</h3>
                    <p className="text-gray-600 break-all">fedexshipcenterchat@gmail.com</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 rounded-sm">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#652C8F] rounded flex items-center justify-center shrink-0">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-gray-900">Address</h3>
                    <p className="text-gray-600">5601 Mark IV Pkwy, Fort Worth, TX 76131, United States</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 rounded-sm">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#FF6600] rounded flex items-center justify-center shrink-0">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-gray-900">Hours</h3>
                    <p className="text-gray-600">Mon-Fri: 8:00 AM - 8:00 PM</p>
                    <p className="text-gray-600">24/7 Support Available</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;

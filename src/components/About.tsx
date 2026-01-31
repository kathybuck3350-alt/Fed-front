import { Award, CheckCircle, Clock, Users } from "lucide-react";

const stats = [
  {
    icon: Award,
    value: "15+",
    label: "Years Experience",
    description: "Industry-leading expertise",
  },
  {
    icon: CheckCircle,
    value: "10,000+",
    label: "Shipments Cleared",
    description: "Successfully processed",
  },
  {
    icon: Award,
    value: "99.8%",
    label: "Success Rate",
    description: "Clearance success ratio",
  },
  {
    icon: Clock,
    value: "24/7",
    label: "Support Available",
    description: "Always here to help",
  },
];

const About = () => {
  return (
    <section id="about" className="py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12 max-w-6xl mx-auto">
          <img
            src="/assets/happy-people-receiviing-package.webp"
            alt="Happy customers - why choose us"
            className="rounded-sm w-full h-80 object-cover shadow-lg order-2 lg:order-1"
          />
          <div className="order-1 lg:order-2">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Why Choose Us
            </h2>
            <p className="text-gray-600 mb-8">
              With over 15 years of experience, we've built a reputation for excellence in customs clearance and international shipping. Our team delivers personalized, reliable service.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-sm border border-gray-200 bg-gray-50/50 hover:border-[#652C8F]/30 transition-colors"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 bg-[#652C8F] rounded mb-4">
                <stat.icon className="h-7 w-7 text-white" />
              </div>
              <div className="text-3xl font-bold text-[#652C8F] mb-2">
                {stat.value}
              </div>
              <div className="font-semibold text-gray-900 mb-1">
                {stat.label}
              </div>
              <div className="text-sm text-gray-500">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;

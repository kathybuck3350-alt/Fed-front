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
    <section id="about" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Us</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            With over 15 years of experience, we've built a reputation for excellence in customs clearance and international shipping
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full mb-4">
                <stat.icon className="h-8 w-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
              <div className="font-semibold mb-1">{stat.label}</div>
              <div className="text-sm text-muted-foreground">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;

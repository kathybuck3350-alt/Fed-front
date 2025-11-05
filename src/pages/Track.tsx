import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Package, MapPin, Calendar, DollarSign, AlertCircle, Bell, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import SecondNavbar from "@/components/SecondNavbar";

interface ShipmentProgress {
  title: string;
  description: string;
  location: string;
  timestamp: string | null;
  completed: boolean;
}

interface Shipment {
  id: string;
  tracking_id: string;
  service_type: string;
  origin: string;
  destination: string;
  estimated_delivery: string;
  shipment_value: number;
  current_location: string;
  customs_status: string;
  status: string;
  progress: ShipmentProgress[];
}

// API base URL - replace with your Node.js backend URL
const API_BASE_URL = "https://fed-bank.vercel.app/api";

const Track = () => {
  const [trackingId, setTrackingId] = useState("");
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trackingId.trim()) {
      toast.error("Please enter a tracking ID");
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/shipments/track/${trackingId.trim()}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          toast.error("Tracking ID not found");
        } else {
          toast.error("Error fetching shipment details");
        }
        setShipment(null);
      } else {
        const data = await response.json();
        setShipment(data.shipment);
        toast.success("Shipment found!");
      }
    } catch (err) {
      toast.error("An error occurred while tracking your shipment");
      setShipment(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return "Pending";
    return new Date(timestamp).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SecondNavbar />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4">Track Your Shipment</h1>
              <p className="text-muted-foreground">
                Enter your tracking ID to view real-time shipment status
              </p>
            </div>

            <Card className="mb-8">
              <CardContent className="pt-6">
                <form onSubmit={handleTrack} className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="trackingId" className="sr-only">Tracking ID</Label>
                    <Input
                      id="trackingId"
                      placeholder="Enter tracking ID (e.g., SCS-20251102-330)"
                      value={trackingId}
                      onChange={(e) => setTrackingId(e.target.value)}
                    />
                  </div>
                  <Button type="submit" disabled={loading}>
                    <Search className="mr-2 h-4 w-4" />
                    {loading ? "Tracking..." : "Track"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {shipment && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Shipment Details</CardTitle>
                      <Badge
                        variant={shipment.status === "Delivered" ? "default" : "secondary"}
                        className="text-sm"
                      >
                        {shipment.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-start gap-3">
                        <Package className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <div className="text-sm text-muted-foreground">Tracking ID</div>
                          <div className="font-semibold">{shipment.tracking_id}</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Package className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <div className="text-sm text-muted-foreground">Service Type</div>
                          <div className="font-semibold">{shipment.service_type}</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <div className="text-sm text-muted-foreground">Origin</div>
                          <div className="font-semibold">{shipment.origin}</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <div className="text-sm text-muted-foreground">Destination</div>
                          <div className="font-semibold">{shipment.destination}</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <div className="text-sm text-muted-foreground">Estimated Delivery</div>
                          <div className="font-semibold">{formatDate(shipment.estimated_delivery)}</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <DollarSign className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <div className="text-sm text-muted-foreground">Shipment Value</div>
                          <div className="font-semibold">${shipment?.shipment_value?.toLocaleString()} USDT</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-accent mt-0.5" />
                        <div>
                          <div className="text-sm text-muted-foreground">Current Location</div>
                          <div className="font-semibold text-accent">{shipment.current_location}</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <div className="text-sm text-muted-foreground">Customs Status</div>
                          <Badge variant={shipment.customs_status === "Cleared" ? "default" : "secondary"}>
                            {shipment.customs_status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Shipment Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {shipment.progress.map((event, index) => (
                        <div key={index} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-4 h-4 rounded-full ${
                                event.completed ? "bg-primary" : "bg-muted"
                              }`}
                            />
                            {index < shipment.progress.length - 1 && (
                              <div className="w-0.5 h-full bg-muted mt-2" />
                            )}
                          </div>
                          <div className="flex-1 pb-8">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h4 className="font-semibold">{event.title}</h4>
                                <p className="text-sm text-muted-foreground">{event.description}</p>
                                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {event.location}
                                  </span>
                                  <span>{formatTimestamp(event.timestamp)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-primary/10 to-accent/10">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4 mb-4">
                      <Bell className="h-6 w-6 text-primary" />
                      <h3 className="font-semibold text-lg">Stay Updated</h3>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      Enable notifications to receive real-time updates about your shipment status.
                    </p>
                    <Button>Enable Notifications</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Need Help?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-muted-foreground">
                        If you have any questions about your shipment, our support team is here to help.
                      </p>
                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-primary" />
                          <span>+(931)677-2299</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-primary" />
                          <span className="break-all">official.FedEx.company8@gmail.com</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Track;

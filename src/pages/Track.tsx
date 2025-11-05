import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Search, 
  Package, 
  MapPin, 
  Calendar, 
  DollarSign, 
  AlertCircle, 
  Bell, 
  Mail, 
  Phone, 
  Scale,
  Truck,
  CreditCard,
  User,
  Home,
  Navigation
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import SecondNavbar from "@/components/SecondNavbar";

interface ReceiverDetails {
  name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state_province?: string;
  zip_code: string;
  country: string;
  phone?: string;
  email?: string;
}

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
  receiver_details: ReceiverDetails;
  type_of_shipment: string;
  weight: number;
  product: string;
  payment_method: string;
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "In Transit":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Out for Delivery":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Exception":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SecondNavbar />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
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
                {/* Main Shipment Status Card */}
                <Card className="border-l-4 border-l-primary">
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <Package className="h-6 w-6 text-primary" />
                          <h2 className="text-2xl font-bold">{shipment.tracking_id}</h2>
                        </div>
                        <p className="text-muted-foreground">
                          {shipment.type_of_shipment} • {shipment.weight} kg • {shipment.product}
                        </p>
                      </div>
                      <Badge 
                        className={`text-lg px-4 py-2 border-2 ${getStatusColor(shipment.status)}`}
                      >
                        {shipment.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Shipment Specifications */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Shipment Specifications
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-muted-foreground">Service Type</div>
                            <div className="font-semibold">{shipment.service_type}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Type of Shipment</div>
                            <div className="font-semibold">{shipment.type_of_shipment}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Weight</div>
                            <div className="font-semibold flex items-center gap-1">
                              <Scale className="h-4 w-4 text-muted-foreground" />
                              {shipment.weight} kg
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Payment Method</div>
                            <div className="font-semibold flex items-center gap-1">
                              <CreditCard className="h-4 w-4 text-muted-foreground" />
                              {shipment.payment_method}
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-sm text-muted-foreground">Product Description</div>
                          <div className="font-semibold p-3 bg-muted/50 rounded-lg mt-1">
                            {shipment.product}
                          </div>
                        </div>

                        <div>
                          <div className="text-sm text-muted-foreground">Shipment Value</div>
                          <div className="font-semibold text-lg flex items-center gap-1">
                            <DollarSign className="h-5 w-5 text-primary" />
                            {shipment.shipment_value.toLocaleString()} USDT
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Route Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Navigation className="h-5 w-5" />
                        Route Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 text-green-600 mt-0.5" />
                          <div>
                            <div className="text-sm text-muted-foreground">Origin</div>
                            <div className="font-semibold">{shipment.origin}</div>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 text-red-600 mt-0.5" />
                          <div>
                            <div className="text-sm text-muted-foreground">Destination</div>
                            <div className="font-semibold">{shipment.destination}</div>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div>
                            <div className="text-sm text-muted-foreground">Current Location</div>
                            <div className="font-semibold text-accent">{shipment.current_location}</div>
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
                          <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                          <div>
                            <div className="text-sm text-muted-foreground">Customs Status</div>
                            <Badge 
                              variant={shipment.customs_status === "Cleared" ? "default" : "secondary"}
                              className="mt-1"
                            >
                              {shipment.customs_status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Receiver Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Receiver Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Full Name</div>
                          <div className="font-semibold text-lg">{shipment.receiver_details.name}</div>
                        </div>
                        
                        <div>
                          <div className="text-sm text-muted-foreground">Address</div>
                          <div className="font-semibold space-y-1 mt-1">
                            <div className="flex items-start gap-2">
                              <Home className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <span>{shipment.receiver_details.address_line1}</span>
                            </div>
                            {shipment.receiver_details.address_line2 && (
                              <div className="text-muted-foreground ml-6">
                                {shipment.receiver_details.address_line2}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-muted-foreground">City</div>
                            <div className="font-semibold">{shipment.receiver_details.city}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">ZIP Code</div>
                            <div className="font-semibold">{shipment.receiver_details.zip_code}</div>
                          </div>
                          {shipment.receiver_details.state_province && (
                            <div>
                              <div className="text-sm text-muted-foreground">State/Province</div>
                              <div className="font-semibold">{shipment.receiver_details.state_province}</div>
                            </div>
                          )}
                          <div>
                            <div className="text-sm text-muted-foreground">Country</div>
                            <div className="font-semibold">{shipment.receiver_details.country}</div>
                          </div>
                        </div>

                        {(shipment.receiver_details.phone || shipment.receiver_details.email) && (
                          <div className="space-y-2 pt-2">
                            {shipment.receiver_details.phone && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-4 w-4 text-primary" />
                                <span>{shipment.receiver_details.phone}</span>
                              </div>
                            )}
                            {shipment.receiver_details.email && (
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-4 w-4 text-primary" />
                                <span className="break-all">{shipment.receiver_details.email}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Shipment Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      Shipment Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {shipment.progress.map((event, index) => (
                        <div key={index} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-4 h-4 rounded-full border-2 ${
                                event.completed 
                                  ? "bg-primary border-primary" 
                                  : "bg-muted border-muted-foreground"
                              }`}
                            />
                            {index < shipment.progress.length - 1 && (
                              <div className="w-0.5 h-full bg-muted mt-2" />
                            )}
                          </div>
                          <div className="flex-1 pb-8">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold">{event.title}</h4>
                                  {event.completed && (
                                    <Badge variant="outline" className="text-xs">
                                      Completed
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {event.location}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {formatTimestamp(event.timestamp)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Additional Information Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <div className="flex flex-col gap-2">
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
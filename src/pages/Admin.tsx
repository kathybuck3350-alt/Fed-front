import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Trash2, Plus, LogOut, Eye, Edit, Package, Activity } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

// API base URL - replace with your Node.js backend URL
const API_BASE_URL = "https://fed-bank.vercel.app/api";

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
  progress: any[];
}

interface ProgressStep {
  title: string;
  description: string;
  location: string;
  timestamp: string;
  completed: boolean;
}

const Admin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const shipmentsPerPage = 10;
  
  // State for creating a new shipment (now in modal)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    serviceType: "Standard",
    origin: "",
    destination: "",
    estimatedDelivery: "",
    shipmentValue: "",
    currentLocation: "",
    customsStatus: "On Hold",
    // New fields
    typeOfShipment: "",
    weight: "",
    product: "",
    paymentMethod: "Sender",
    // Receiver details
    receiverName: "",
    receiverAddress1: "",
    receiverAddress2: "",
    receiverCity: "",
    receiverState: "",
    receiverZip: "",
    receiverCountry: "",
    receiverPhone: "",
    receiverEmail: "",
  });
  
  // State for viewing a shipment
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewShipment, setViewShipment] = useState<Shipment | null>(null);

  // State for editing a shipment
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editShipmentId, setEditShipmentId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    serviceType: "",
    origin: "",
    destination: "",
    estimatedDelivery: "",
    shipmentValue: "",
    currentLocation: "",
    customsStatus: "",
    status: "",
    // New fields
    typeOfShipment: "",
    weight: "",
    product: "",
    paymentMethod: "",
    // Receiver details
    receiverName: "",
    receiverAddress1: "",
    receiverAddress2: "",
    receiverCity: "",
    receiverState: "",
    receiverZip: "",
    receiverCountry: "",
    receiverPhone: "",
    receiverEmail: "",
  });

  // State for updating progress
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [isProgressDialogOpen, setIsProgressDialogOpen] = useState(false);
  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>([]);
  const [newProgress, setNewProgress] = useState({
    title: "",
    description: "",
    location: "",
    completed: false,
  });

  useEffect(() => {
    if (isLoggedIn) {
      fetchShipments();
    }
  }, [isLoggedIn]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Hardcoded credentials for local admin panel access
    if (username === "vico" && password === "vic1404174") {
      setIsLoggedIn(true);
      toast.success("Login successful!");
    } else {
      toast.error("Invalid credentials");
    }
  };

  const generateTrackingId = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const random = Math.floor(Math.random() * 1000);
    return `SCS-${year}${month}${day}-${random}`;
  };

  const fetchShipments = async (page: number = 1) => {
    try {
      const response = await fetch(`${API_BASE_URL}/shipments?page=${page}&limit=${shipmentsPerPage}`);

      if (!response.ok) {
        toast.error("Error fetching shipments");
        return;
      }

      const data = await response.json();
      setShipments(data.shipments || []);
      setTotalPages(Math.ceil(data.total / shipmentsPerPage));
      setCurrentPage(page);
    } catch (error) {
      toast.error("Error fetching shipments");
    }
  };

  const resetFormData = () => {
    setFormData({
      serviceType: "Standard",
      origin: "",
      destination: "",
      estimatedDelivery: "",
      shipmentValue: "",
      currentLocation: "",
      customsStatus: "On Hold",
      typeOfShipment: "",
      weight: "",
      product: "",
      paymentMethod: "Sender",
      receiverName: "",
      receiverAddress1: "",
      receiverAddress2: "",
      receiverCity: "",
      receiverState: "",
      receiverZip: "",
      receiverCountry: "",
      receiverPhone: "",
      receiverEmail: "",
    });
  };

  const handleCreateShipment = async (e: React.FormEvent) => {
    e.preventDefault();

    // Enhanced validation for new required fields
    if (!formData.serviceType || !formData.origin || !formData.destination || 
        !formData.estimatedDelivery || !formData.shipmentValue || !formData.currentLocation ||
        !formData.typeOfShipment || !formData.weight || !formData.product ||
        !formData.receiverName || !formData.receiverAddress1 || !formData.receiverCity || 
        !formData.receiverZip || !formData.receiverCountry) {
      toast.error("Please fill in all required fields");
      return;
    }

    const trackingId = generateTrackingId();
    
    // Enhanced progress steps with "Delivered" status
    const progress = [
      {
        title: "Package Received",
        description: "Shipment received at origin facility",
        location: formData.origin,
        timestamp: new Date().toISOString(),
        completed: true,
      },
      {
        title: "In Transit",
        description: "Package is on the way",
        location: formData.currentLocation,
        timestamp: new Date().toISOString(),
        completed: true,
      },
      {
        title: "Customs Clearance",
        description: formData.customsStatus === "Cleared" ? "Package cleared customs" : "Package awaiting customs clearance",
        location: formData.currentLocation,
        timestamp: new Date().toISOString(),
        completed: formData.customsStatus === "Cleared",
      },
      {
        title: "Out for Delivery",
        description: "Package will be delivered soon",
        location: formData.destination.split(",")[0],
        timestamp: null,
        completed: false,
      },
      {
        title: "Delivered",
        description: "Package has been successfully delivered",
        location: formData.destination.split(",")[0],
        timestamp: null,
        completed: false,
      },
    ];

    try {
      const response = await fetch(`${API_BASE_URL}/shipments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tracking_id: trackingId,
          service_type: formData.serviceType,
          origin: formData.origin,
          destination: formData.destination,
          // New specification fields
          type_of_shipment: formData.typeOfShipment,
          weight: parseFloat(formData.weight),
          product: formData.product,
          payment_method: formData.paymentMethod,
          // Receiver details
          receiver_details: {
            name: formData.receiverName,
            address_line1: formData.receiverAddress1,
            address_line2: formData.receiverAddress2 || "",
            city: formData.receiverCity,
            state_province: formData.receiverState || "",
            zip_code: formData.receiverZip,
            country: formData.receiverCountry,
            phone: formData.receiverPhone || "",
            email: formData.receiverEmail || "",
          },
          estimated_delivery: formData.estimatedDelivery,
          shipment_value: parseFloat(formData.shipmentValue),
          current_location: formData.currentLocation,
          customs_status: formData.customsStatus,
          status: "In Transit",
          progress,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.error || "Error creating shipment");
        return;
      }

      toast.success(`Shipment created! Tracking ID: ${trackingId}`);
      // Reset form and close modal
      resetFormData();
      setIsCreateDialogOpen(false);
      fetchShipments(currentPage);
    } catch (error) {
      toast.error("Error creating shipment");
    }
  };

  const handleDeleteShipment = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/shipments/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        toast.error("Error deleting shipment");
      } else {
        toast.success("Shipment deleted");
        fetchShipments(currentPage);
      }
    } catch (error) {
      toast.error("Error deleting shipment");
    }
  };

  const handleViewShipment = (shipment: Shipment) => {
    setViewShipment(shipment);
    setIsViewDialogOpen(true);
  };
  
  const openEditDialog = (shipment: Shipment) => {
    setEditShipmentId(shipment.id);
    setEditFormData({
      serviceType: shipment.service_type,
      origin: shipment.origin,
      destination: shipment.destination,
      estimatedDelivery: shipment.estimated_delivery,
      shipmentValue: String(shipment.shipment_value),
      currentLocation: shipment.current_location,
      customsStatus: shipment.customs_status,
      status: shipment.status,
      // New fields
      typeOfShipment: shipment.type_of_shipment,
      weight: String(shipment.weight),
      product: shipment.product,
      paymentMethod: shipment.payment_method,
      // Receiver details
      receiverName: shipment.receiver_details.name,
      receiverAddress1: shipment.receiver_details.address_line1,
      receiverAddress2: shipment.receiver_details.address_line2 || "",
      receiverCity: shipment.receiver_details.city,
      receiverState: shipment.receiver_details.state_province || "",
      receiverZip: shipment.receiver_details.zip_code,
      receiverCountry: shipment.receiver_details.country,
      receiverPhone: shipment.receiver_details.phone || "",
      receiverEmail: shipment.receiver_details.email || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editShipmentId) return;

    // Enhanced validation
    if (!editFormData.serviceType || !editFormData.origin || !editFormData.destination || 
        !editFormData.estimatedDelivery || !editFormData.shipmentValue || !editFormData.currentLocation || 
        !editFormData.status || !editFormData.customsStatus || !editFormData.typeOfShipment || 
        !editFormData.weight || !editFormData.product || !editFormData.receiverName || 
        !editFormData.receiverAddress1 || !editFormData.receiverCity || !editFormData.receiverZip || 
        !editFormData.receiverCountry) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/shipments/${editShipmentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          service_type: editFormData.serviceType,
          origin: editFormData.origin,
          destination: editFormData.destination,
          estimated_delivery: editFormData.estimatedDelivery,
          shipment_value: parseFloat(editFormData.shipmentValue),
          current_location: editFormData.currentLocation,
          customs_status: editFormData.customsStatus,
          status: editFormData.status,
          // New fields
          type_of_shipment: editFormData.typeOfShipment,
          weight: parseFloat(editFormData.weight),
          product: editFormData.product,
          payment_method: editFormData.paymentMethod,
          // Receiver details
          receiver_details: {
            name: editFormData.receiverName,
            address_line1: editFormData.receiverAddress1,
            address_line2: editFormData.receiverAddress2 || "",
            city: editFormData.receiverCity,
            state_province: editFormData.receiverState || "",
            zip_code: editFormData.receiverZip,
            country: editFormData.receiverCountry,
            phone: editFormData.receiverPhone || "",
            email: editFormData.receiverEmail || "",
          },
        }),
      });

      if (!response.ok) {
        toast.error("Error updating shipment");
      } else {
        toast.success(`Shipment ${editShipmentId} updated!`);
        setIsEditDialogOpen(false);
        fetchShipments(currentPage);
      }
    } catch (error) {
      toast.error("Error updating shipment");
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchShipments(newPage);
    }
  };

  const openProgressDialog = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setProgressSteps(shipment.progress || []);
    setIsProgressDialogOpen(true);
  };

  const handleAddProgressStep = () => {
    if (!newProgress.title || !newProgress.description || !newProgress.location) {
      toast.error("Please fill in all progress fields");
      return;
    }

    const step: ProgressStep = {
      ...newProgress,
      timestamp: new Date().toISOString(),
    };

    setProgressSteps([...progressSteps, step]);
    setNewProgress({
      title: "",
      description: "",
      location: "",
      completed: false,
    });
    toast.success("Progress step added");
  };

  const handleRemoveProgressStep = (index: number) => {
    const updated = progressSteps.filter((_, i) => i !== index);
    setProgressSteps(updated);
    toast.success("Progress step removed");
  };

  const handleToggleProgressComplete = (index: number) => {
    const updated = [...progressSteps];
    updated[index].completed = !updated[index].completed;
    setProgressSteps(updated);
  };

  // Combined function for adding progress and saving
  const handleAddAndSaveProgress = async () => {
    if (!selectedShipment) return;

    // If there's a new progress step, add it first
    if (newProgress.title && newProgress.description && newProgress.location) {
      const step: ProgressStep = {
        ...newProgress,
        timestamp: new Date().toISOString(),
      };
      setProgressSteps(prev => [...prev, step]);
      setNewProgress({
        title: "",
        description: "",
        location: "",
        completed: false,
      });
    }

    // Then save all progress
    try {
      const response = await fetch(`${API_BASE_URL}/shipments/${selectedShipment.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          progress: progressSteps,
          current_location: progressSteps[progressSteps.length - 1]?.location || selectedShipment.current_location,
        }),
      });

      if (!response.ok) {
        toast.error("Error updating shipment progress");
      } else {
        toast.success("Shipment progress updated!");
        setIsProgressDialogOpen(false);
        fetchShipments(currentPage);
      }
    } catch (error) {
      toast.error("Error updating shipment progress");
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Card className="w-full max-w-md border-gray-200 rounded-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-[#652C8F] to-[#FF6600]" />
          <CardHeader>
            <CardTitle className="text-2xl text-center text-gray-900">Admin Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="vico"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-[#652C8F] hover:bg-[#5520a0]  text-white font-semibold rounded-sm">
                Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="h-1 bg-gradient-to-r from-[#652C8F] to-[#FF6600]" />
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/assets/fedex-logo.svg" alt="FedEx" className="h-10 w-auto object-contain" />
            <h1 className="text-xl font-bold text-gray-900">Ship Center - Admin</h1>
          </div>
          <Button variant="outline" onClick={() => setIsLoggedIn(false)}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      <main className="py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Admin Panel</h2>

          {/* Add Shipment Button and Modal */}
          <div className="mb-8">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-[#FF6600] hover:bg-[#E55A00] text-white font-semibold rounded-sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Shipment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Shipment</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateShipment} className="space-y-6">
                  {/* Shipment Specifications Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Shipment Specifications</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="serviceType">Service Type</Label>
                        <Select
                          value={formData.serviceType}
                          onValueChange={(value) => setFormData({ ...formData, serviceType: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select service" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Standard">Standard</SelectItem>
                            <SelectItem value="Express">Express</SelectItem>
                            <SelectItem value="Premium">Premium</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="typeOfShipment">Type of Shipment *</Label>
                        <Select
                          value={formData.typeOfShipment}
                          onValueChange={(value) => setFormData({ ...formData, typeOfShipment: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Document">Document</SelectItem>
                            <SelectItem value="Package">Package</SelectItem>
                            <SelectItem value="Freight">Freight</SelectItem>
                            <SelectItem value="Parcel">Parcel</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="weight">Weight (kg) *</Label>
                        <Input
                          id="weight"
                          type="number"
                          step="0.1"
                          min="0"
                          value={formData.weight}
                          onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                          placeholder="e.g., 2.5"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="product">Product Description *</Label>
                        <Input
                          id="product"
                          value={formData.product}
                          onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                          placeholder="e.g., Electronics, Documents"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="paymentMethod">Payment Method</Label>
                        <Select
                          value={formData.paymentMethod}
                          onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USDT">USDT</SelectItem>
                            <SelectItem value="Gift_Card">Gift_Card</SelectItem>
                            <SelectItem value="Wire_Transfer">Wire_Transfer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="shipmentValue">Shipment Value (USDT) *</Label>
                        <Input
                          id="shipmentValue"
                          type="number"
                          value={formData.shipmentValue}
                          onChange={(e) => setFormData({ ...formData, shipmentValue: e.target.value })}
                          placeholder="e.g., 10000"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Route Information Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Route Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="origin">Origin *</Label>
                        <Input
                          id="origin"
                          value={formData.origin}
                          onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                          placeholder="e.g., New York, USA"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="destination">Destination *</Label>
                        <Input
                          id="destination"
                          value={formData.destination}
                          onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                          placeholder="e.g., Los Angeles, USA"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="estimatedDelivery">Estimated Delivery *</Label>
                        <Input
                          id="estimatedDelivery"
                          type="date"
                          value={formData.estimatedDelivery}
                          onChange={(e) => setFormData({ ...formData, estimatedDelivery: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="currentLocation">Current Location *</Label>
                        <Input
                          id="currentLocation"
                          value={formData.currentLocation}
                          onChange={(e) => setFormData({ ...formData, currentLocation: e.target.value })}
                          placeholder="e.g., Kansas City, Missouri"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="customsStatus">Customs Status</Label>
                        <Select
                          value={formData.customsStatus}
                          onValueChange={(value) => setFormData({ ...formData, customsStatus: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Cleared">Cleared</SelectItem>
                            <SelectItem value="On Hold">On Hold</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Receiver Details Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Receiver Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="receiverName">Full Name *</Label>
                        <Input
                          id="receiverName"
                          value={formData.receiverName}
                          onChange={(e) => setFormData({ ...formData, receiverName: e.target.value })}
                          placeholder="e.g., John Doe"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="receiverAddress1">Address Line 1 *</Label>
                        <Input
                          id="receiverAddress1"
                          value={formData.receiverAddress1}
                          onChange={(e) => setFormData({ ...formData, receiverAddress1: e.target.value })}
                          placeholder="e.g., 123 Main Street"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="receiverAddress2">Address Line 2</Label>
                        <Input
                          id="receiverAddress2"
                          value={formData.receiverAddress2}
                          onChange={(e) => setFormData({ ...formData, receiverAddress2: e.target.value })}
                          placeholder="e.g., Apt 4B"
                        />
                      </div>

                      <div>
                        <Label htmlFor="receiverCity">City *</Label>
                        <Input
                          id="receiverCity"
                          value={formData.receiverCity}
                          onChange={(e) => setFormData({ ...formData, receiverCity: e.target.value })}
                          placeholder="e.g., Los Angeles"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="receiverState">State/Province</Label>
                        <Input
                          id="receiverState"
                          value={formData.receiverState}
                          onChange={(e) => setFormData({ ...formData, receiverState: e.target.value })}
                          placeholder="e.g., California"
                        />
                      </div>

                      <div>
                        <Label htmlFor="receiverZip">ZIP/Postal Code *</Label>
                        <Input
                          id="receiverZip"
                          value={formData.receiverZip}
                          onChange={(e) => setFormData({ ...formData, receiverZip: e.target.value })}
                          placeholder="e.g., 90001"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="receiverCountry">Country *</Label>
                        <Input
                          id="receiverCountry"
                          value={formData.receiverCountry}
                          onChange={(e) => setFormData({ ...formData, receiverCountry: e.target.value })}
                          placeholder="e.g., United States"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="receiverPhone">Phone</Label>
                        <Input
                          id="receiverPhone"
                          value={formData.receiverPhone}
                          onChange={(e) => setFormData({ ...formData, receiverPhone: e.target.value })}
                          placeholder="e.g., +1 234 567 8900"
                        />
                      </div>

                      <div>
                        <Label htmlFor="receiverEmail">Email</Label>
                        <Input
                          id="receiverEmail"
                          type="email"
                          value={formData.receiverEmail}
                          onChange={(e) => setFormData({ ...formData, receiverEmail: e.target.value })}
                          placeholder="e.g., john@example.com"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setIsCreateDialogOpen(false);
                        resetFormData();
                      }} 
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1 bg-[#652C8F] hover:bg-[#5520a0]  text-white font-semibold rounded-sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Shipment
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* All Shipments Table Card */}
          <Card className="rounded-sm border-gray-200 overflow-hidden">
            <div className="h-1 bg-[#652C8F]" />
            <CardHeader>
              <CardTitle className="text-gray-900">All Shipments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {shipments.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No shipments yet</p>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Tracking ID</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Weight</TableHead>
                            <TableHead>Product</TableHead>
                            <TableHead>Origin</TableHead>
                            <TableHead>Destination</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Value</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {shipments.map((shipment) => (
                            <TableRow key={shipment.id}>
                              <TableCell className="font-mono text-sm">{shipment.tracking_id}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{shipment.type_of_shipment}</Badge>
                              </TableCell>
                              <TableCell>{shipment.weight} kg</TableCell>
                              <TableCell className="text-sm max-w-[150px] truncate">{shipment.product}</TableCell>
                              <TableCell className="text-sm">{shipment.origin}</TableCell>
                              <TableCell className="text-sm max-w-[150px] truncate">{shipment.destination}</TableCell>
                              <TableCell>
                                <Badge variant="secondary">{shipment.status}</Badge>
                              </TableCell>
                              <TableCell>${shipment.shipment_value.toLocaleString()}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {/* Edit Shipment Details Button */}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openEditDialog(shipment)}
                                    title="Edit Shipment Details"
                                  >
                                    <Package className="h-4 w-4" />
                                  </Button>
                                  {/* Edit Progress Button */}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openProgressDialog(shipment)}
                                    title="Edit Progress Activity"
                                  >
                                    <Activity className="h-4 w-4" />
                                  </Button>
                                  {/* View Shipment Button */}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleViewShipment(shipment)}
                                    title="View Details"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  {/* Delete Shipment Button */}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteShipment(shipment.id)}
                                    title="Delete Shipment"
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Page {currentPage} of {totalPages}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Progress Update Dialog */}
      <Dialog open={isProgressDialogOpen} onOpenChange={setIsProgressDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Update Shipment Progress - {selectedShipment?.tracking_id}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Current Progress Steps */}
            <div>
              <h3 className="font-semibold mb-3">Current Progress</h3>
              <div className="space-y-2">
                {progressSteps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                    <input
                      type="checkbox"
                      checked={step.completed}
                      onChange={() => handleToggleProgressComplete(index)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{step.title}</div>
                      <div className="text-sm text-gray-600">{step.description}</div>
                      <div className="text-xs text-gray-500 mt-1">📍 {step.location}</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveProgressStep(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Add New Progress Step */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Add New Progress Step</h3>
              <div className="space-y-3">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={newProgress.title}
                    onChange={(e) => setNewProgress({ ...newProgress, title: e.target.value })}
                    placeholder="e.g., In Transit"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newProgress.description}
                    onChange={(e) => setNewProgress({ ...newProgress, description: e.target.value })}
                    placeholder="e.g., In Transit to Next Facility"
                  />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input
                    value={newProgress.location}
                    onChange={(e) => setNewProgress({ ...newProgress, location: e.target.value })}
                    placeholder="e.g., Kansas City, Missouri"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newProgress.completed}
                    onChange={(e) => setNewProgress({ ...newProgress, completed: e.target.checked })}
                    id="completed"
                  />
                  <Label htmlFor="completed">Mark as completed</Label>
                </div>
              </div>
            </div>

            {/* Combined Save Button */}
            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsProgressDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleAddAndSaveProgress} className="flex-1 bg-[#FF6600] hover:bg-[#E55A00] text-white font-semibold rounded-sm">
                <Plus className="mr-2 h-4 w-4" />
                Add & Save Progress
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Shipment Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Shipment - {editFormData.origin} to {editFormData.destination}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateShipment} className="space-y-6">
            {/* Shipment Specifications */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Shipment Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editServiceType">Service Type</Label>
                  <Select
                    value={editFormData.serviceType}
                    onValueChange={(value) => setEditFormData({ ...editFormData, serviceType: value })}
                  >
                    <SelectTrigger id="editServiceType">
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Standard">Standard</SelectItem>
                      <SelectItem value="Express">Express</SelectItem>
                      <SelectItem value="Premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="editTypeOfShipment">Type of Shipment</Label>
                  <Select
                    value={editFormData.typeOfShipment}
                    onValueChange={(value) => setEditFormData({ ...editFormData, typeOfShipment: value })}
                  >
                    <SelectTrigger id="editTypeOfShipment">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Document">Document</SelectItem>
                      <SelectItem value="Package">Package</SelectItem>
                      <SelectItem value="Freight">Freight</SelectItem>
                      <SelectItem value="Parcel">Parcel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="editWeight">Weight (kg)</Label>
                  <Input
                    id="editWeight"
                    type="number"
                    step="0.1"
                    min="0"
                    value={editFormData.weight}
                    onChange={(e) => setEditFormData({ ...editFormData, weight: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="editProduct">Product Description</Label>
                  <Input
                    id="editProduct"
                    value={editFormData.product}
                    onChange={(e) => setEditFormData({ ...editFormData, product: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="editPaymentMethod">Payment Method</Label>
                  <Select
                    value={editFormData.paymentMethod}
                    onValueChange={(value) => setEditFormData({ ...editFormData, paymentMethod: value })}
                  >
                    <SelectTrigger id="editPaymentMethod">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sender">Sender</SelectItem>
                      <SelectItem value="Receiver">Receiver</SelectItem>
                      <SelectItem value="Third Party">Third Party</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="editShipmentValue">Shipment Value (USDT)</Label>
                  <Input
                    id="editShipmentValue"
                    type="number"
                    value={editFormData.shipmentValue}
                    onChange={(e) => setEditFormData({ ...editFormData, shipmentValue: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Route Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Route Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editOrigin">Origin</Label>
                  <Input
                    id="editOrigin"
                    value={editFormData.origin}
                    onChange={(e) => setEditFormData({ ...editFormData, origin: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="editDestination">Destination</Label>
                  <Input
                    id="editDestination"
                    value={editFormData.destination}
                    onChange={(e) => setEditFormData({ ...editFormData, destination: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="editEstimatedDelivery">Estimated Delivery</Label>
                  <Input
                    id="editEstimatedDelivery"
                    type="date"
                    value={editFormData.estimatedDelivery}
                    onChange={(e) => setEditFormData({ ...editFormData, estimatedDelivery: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="editCurrentLocation">Current Location</Label>
                  <Input
                    id="editCurrentLocation"
                    value={editFormData.currentLocation}
                    onChange={(e) => setEditFormData({ ...editFormData, currentLocation: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="editCustomsStatus">Customs Status</Label>
                  <Select
                    value={editFormData.customsStatus}
                    onValueChange={(value) => setEditFormData({ ...editFormData, customsStatus: value })}
                  >
                    <SelectTrigger id="editCustomsStatus">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cleared">Cleared</SelectItem>
                      <SelectItem value="On Hold">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="editStatus">Status</Label>
                  <Select
                    value={editFormData.status}
                    onValueChange={(value) => setEditFormData({ ...editFormData, status: value })}
                  >
                    <SelectTrigger id="editStatus">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="In Transit">In Transit</SelectItem>
                      <SelectItem value="Out for Delivery">Out for Delivery</SelectItem>
                      <SelectItem value="Delivered">Delivered</SelectItem>
                      <SelectItem value="Exception">Exception</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Receiver Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Receiver Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editReceiverName">Full Name</Label>
                  <Input
                    id="editReceiverName"
                    value={editFormData.receiverName}
                    onChange={(e) => setEditFormData({ ...editFormData, receiverName: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="editReceiverAddress1">Address Line 1</Label>
                  <Input
                    id="editReceiverAddress1"
                    value={editFormData.receiverAddress1}
                    onChange={(e) => setEditFormData({ ...editFormData, receiverAddress1: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="editReceiverAddress2">Address Line 2</Label>
                  <Input
                    id="editReceiverAddress2"
                    value={editFormData.receiverAddress2}
                    onChange={(e) => setEditFormData({ ...editFormData, receiverAddress2: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="editReceiverCity">City</Label>
                  <Input
                    id="editReceiverCity"
                    value={editFormData.receiverCity}
                    onChange={(e) => setEditFormData({ ...editFormData, receiverCity: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="editReceiverState">State/Province</Label>
                  <Input
                    id="editReceiverState"
                    value={editFormData.receiverState}
                    onChange={(e) => setEditFormData({ ...editFormData, receiverState: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="editReceiverZip">ZIP/Postal Code</Label>
                  <Input
                    id="editReceiverZip"
                    value={editFormData.receiverZip}
                    onChange={(e) => setEditFormData({ ...editFormData, receiverZip: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="editReceiverCountry">Country</Label>
                  <Input
                    id="editReceiverCountry"
                    value={editFormData.receiverCountry}
                    onChange={(e) => setEditFormData({ ...editFormData, receiverCountry: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="editReceiverPhone">Phone</Label>
                  <Input
                    id="editReceiverPhone"
                    value={editFormData.receiverPhone}
                    onChange={(e) => setEditFormData({ ...editFormData, receiverPhone: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="editReceiverEmail">Email</Label>
                  <Input
                    id="editReceiverEmail"
                    type="email"
                    value={editFormData.receiverEmail}
                    onChange={(e) => setEditFormData({ ...editFormData, receiverEmail: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full bg-[#652C8F] hover:bg-[#5520a0]  text-white font-semibold rounded-sm">
              <Package className="mr-2 h-4 w-4" />
              Save Shipment Details
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Shipment Dialog - Now Scrollable */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Shipment Details - {viewShipment?.tracking_id}</DialogTitle>
          </DialogHeader>

          {viewShipment ? (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div><strong>Tracking ID:</strong> {viewShipment.tracking_id}</div>
                  <div><strong>Service Type:</strong> {viewShipment.service_type}</div>
                  <div><strong>Type of Shipment:</strong> {viewShipment.type_of_shipment}</div>
                  <div><strong>Weight:</strong> {viewShipment.weight} kg</div>
                  <div><strong>Product:</strong> {viewShipment.product}</div>
                  <div><strong>Payment Method:</strong> {viewShipment.payment_method}</div>
                </div>
                <div className="space-y-3">
                  <div><strong>Origin:</strong> {viewShipment.origin}</div>
                  <div><strong>Destination:</strong> {viewShipment.destination}</div>
                  <div><strong>Estimated Delivery:</strong> {viewShipment.estimated_delivery}</div>
                  <div><strong>Shipment Value:</strong> ${viewShipment.shipment_value.toLocaleString()}</div>
                  <div><strong>Current Location:</strong> {viewShipment.current_location}</div>
                  <div><strong>Customs Status:</strong> {viewShipment.customs_status}</div>
                  <div><strong>Status:</strong> {viewShipment.status}</div>
                </div>
              </div>

              {/* Receiver Details */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3 text-lg">Receiver Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><strong>Name:</strong> {viewShipment.receiver_details.name}</div>
                  <div><strong>Address:</strong> {viewShipment.receiver_details.address_line1}</div>
                  {viewShipment.receiver_details.address_line2 && (
                    <div><strong>Address 2:</strong> {viewShipment.receiver_details.address_line2}</div>
                  )}
                  <div><strong>City:</strong> {viewShipment.receiver_details.city}</div>
                  {viewShipment.receiver_details.state_province && (
                    <div><strong>State:</strong> {viewShipment.receiver_details.state_province}</div>
                  )}
                  <div><strong>ZIP:</strong> {viewShipment.receiver_details.zip_code}</div>
                  <div><strong>Country:</strong> {viewShipment.receiver_details.country}</div>
                  {viewShipment.receiver_details.phone && (
                    <div><strong>Phone:</strong> {viewShipment.receiver_details.phone}</div>
                  )}
                  {viewShipment.receiver_details.email && (
                    <div><strong>Email:</strong> {viewShipment.receiver_details.email}</div>
                  )}
                </div>
              </div>

              {/* Progress History */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3 text-lg">Progress History</h4>
                <div className="space-y-3">
                  {viewShipment.progress.map((step, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-3 h-3 rounded-full ${step.completed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <div className="font-medium">{step.title}</div>
                        {step.completed && (
                          <Badge variant="outline" className="text-green-600 border-green-200">
                            Completed
                          </Badge>
                        )}
                      </div>
                      <div className="text-gray-600 text-sm mb-1">{step.description}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <span>📍</span>
                        {step.location}
                      </div>
                      {step.timestamp && (
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(step.timestamp).toLocaleString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <p>No shipment selected.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
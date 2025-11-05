import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Trash2, Plus, LogOut, Eye, Edit, Package } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

// API base URL - replace with your Node.js backend URL
const API_BASE_URL = "https://fed-bank.vercel.app/api";

// --- UPDATED INTERFACES ---
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
  progress: any[];
  // New fields
  receiver_name: string;
  receiver_email: string;
  receiver_phone: string;
  type_of_shipment: string;
  weight: string;
  product: string;
  payment_method: string;
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
  
  // State for NEW shipment creation (now in a modal)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    serviceType: "",
    origin: "",
    destination: "",
    estimatedDelivery: "",
    shipmentValue: "",
    currentLocation: "",
    customsStatus: "On Hold",
    // New fields
    receiverName: "",
    receiverEmail: "",
    receiverPhone: "",
    typeOfShipment: "",
    weight: "",
    product: "",
    paymentMethod: "",
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
    receiverName: "",
    receiverEmail: "",
    receiverPhone: "",
    typeOfShipment: "",
    weight: "",
    product: "",
    paymentMethod: "",
  });

  // State for updating progress
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [isProgressDialogOpen, setIsProgressDialogOpen] = useState(false);
  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>([]);
  const [newProgress, setNewProgress] = useState({
    title: "",
    description: "",
    location: "",
    // Added 'delivered' option
    status: "In Transit",
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

  const handleCreateShipment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.serviceType || !formData.origin || !formData.destination || !formData.estimatedDelivery || !formData.shipmentValue || !formData.currentLocation || !formData.receiverName || !formData.receiverEmail || !formData.receiverPhone || !formData.typeOfShipment || !formData.weight || !formData.product || !formData.paymentMethod) {
      toast.error("Please fill in all required fields");
      return;
    }

    const trackingId = generateTrackingId();
    // Initial progress steps
    const progress = [
      {
        title: "Package Received",
        description: "Shipment received at origin facility",
        location: formData.origin.split(",")[0],
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
          estimated_delivery: formData.estimatedDelivery,
          shipment_value: parseFloat(formData.shipmentValue),
          current_location: formData.currentLocation,
          customs_status: formData.customsStatus,
          status: "In Transit",
          progress,
          // New fields
          receiver_name: formData.receiverName,
          receiver_email: formData.receiverEmail,
          receiver_phone: formData.receiverPhone,
          type_of_shipment: formData.typeOfShipment,
          weight: formData.weight,
          product: formData.product,
          payment_method: formData.paymentMethod,
        }),
      });

      if (!response.ok) {
        toast.error("Error creating shipment");
      } else {
        toast.success(`Shipment created! Tracking ID: ${trackingId}`);
        // Reset form
        setFormData({
          serviceType: "",
          origin: "",
          destination: "",
          estimatedDelivery: "",
          shipmentValue: "",
          currentLocation: "",
          customsStatus: "On Hold",
          receiverName: "",
          receiverEmail: "",
          receiverPhone: "",
          typeOfShipment: "",
          weight: "",
          product: "",
          paymentMethod: "",
        });
        setIsCreateDialogOpen(false); // Close modal
        fetchShipments(currentPage);
      }
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
      receiverName: shipment.receiver_name,
      receiverEmail: shipment.receiver_email,
      receiverPhone: shipment.receiver_phone,
      typeOfShipment: shipment.type_of_shipment,
      weight: shipment.weight,
      product: shipment.product,
      paymentMethod: shipment.payment_method,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editShipmentId) return;

    if (!editFormData.serviceType || !editFormData.origin || !editFormData.destination || !editFormData.estimatedDelivery || !editFormData.shipmentValue || !editFormData.currentLocation || !editFormData.status || !editFormData.customsStatus || !editFormData.receiverName || !editFormData.receiverEmail || !editFormData.receiverPhone || !editFormData.typeOfShipment || !editFormData.weight || !editFormData.product || !editFormData.paymentMethod) {
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
          receiver_name: editFormData.receiverName,
          receiver_email: editFormData.receiverEmail,
          receiver_phone: editFormData.receiverPhone,
          type_of_shipment: editFormData.typeOfShipment,
          weight: editFormData.weight,
          product: editFormData.product,
          payment_method: editFormData.paymentMethod,
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
    setNewProgress({
      title: "",
      description: "",
      location: "",
      status: "In Transit", // Reset new progress form
    });
  };

  // Changed to local state update only
  const handleAddProgressStep = () => {
    if (!newProgress.title || !newProgress.description || !newProgress.location) {
      toast.error("Please fill in all progress fields");
      return;
    }

    const stepTitle = newProgress.status === "Delivered" ? "Delivered" : newProgress.title;

    const step: ProgressStep = {
      title: stepTitle,
      description: newProgress.description,
      location: newProgress.location,
      timestamp: new Date().toISOString(),
      completed: newProgress.status !== "In Transit", // Mark as completed if not "In Transit"
    };

    setProgressSteps([...progressSteps, step]);
    setNewProgress({
      title: "",
      description: "",
      location: "",
      status: "In Transit",
    });
    toast.success("New progress step added locally. Click 'Save Progress' to update the database.");
  };

  const handleRemoveProgressStep = (index: number) => {
    const updated = progressSteps.filter((_, i) => i !== index);
    setProgressSteps(updated);
    toast.success("Progress step removed locally");
  };

  const handleToggleProgressComplete = (index: number) => {
    const updated = [...progressSteps];
    updated[index].completed = !updated[index].completed;
    setProgressSteps(updated);
  };
  
  // Consolidated 'Add Progress' and 'Save Progress' logic in 'Save Progress'
  const handleUpdateAndSaveProgress = async () => {
    if (!selectedShipment) return;

    // Determine the new shipment status based on the last progress step
    const lastStep = progressSteps[progressSteps.length - 1];
    let newStatus = selectedShipment.status;

    if (lastStep && lastStep.title.toLowerCase() === "delivered" && lastStep.completed) {
      newStatus = "Delivered";
    } else if (lastStep && lastStep.title.toLowerCase() === "out for delivery" && lastStep.completed) {
      newStatus = "Out for Delivery";
    } else if (lastStep && lastStep.completed) {
      newStatus = "In Transit";
    }
    
    // Update current location to the location of the latest step
    const newLocation = lastStep?.location || selectedShipment.current_location;

    try {
      const response = await fetch(`${API_BASE_URL}/shipments/${selectedShipment.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          progress: progressSteps,
          current_location: newLocation,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        toast.error("Error saving shipment progress");
      } else {
        toast.success(`Shipment progress and status updated to **${newStatus}**!`);
        setIsProgressDialogOpen(false);
        fetchShipments(currentPage);
      }
    } catch (error) {
      toast.error("Error saving shipment progress");
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Admin Login</CardTitle>
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
              <Button type="submit" className="w-full">
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
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent">
            Admin Panel 🚢
          </h1>
          <Button variant="outline" onClick={() => setIsLoggedIn(false)}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      <main className="py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Shipment Management</h2>

          {/* Add Shipment Button / Modal Trigger */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mb-6">
                <Plus className="mr-2 h-4 w-4" />
                Add New Shipment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Shipment Record</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateShipment} className="space-y-6">
                
                {/* Receiver Information Section */}
                <div className="space-y-4 border p-4 rounded-lg">
                  <h4 className="font-semibold text-lg">Receiver Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="receiverName">Receiver Name</Label>
                      <Input id="receiverName" value={formData.receiverName} onChange={(e) => setFormData({ ...formData, receiverName: e.target.value })} required />
                    </div>
                    <div>
                      <Label htmlFor="receiverEmail">Receiver Email</Label>
                      <Input id="receiverEmail" type="email" value={formData.receiverEmail} onChange={(e) => setFormData({ ...formData, receiverEmail: e.target.value })} required />
                    </div>
                    <div>
                      <Label htmlFor="receiverPhone">Receiver Phone</Label>
                      <Input id="receiverPhone" type="tel" value={formData.receiverPhone} onChange={(e) => setFormData({ ...formData, receiverPhone: e.target.value })} required />
                    </div>
                  </div>
                </div>

                {/* Basic Shipment Details */}
                <div className="space-y-4 border p-4 rounded-lg">
                  <h4 className="font-semibold text-lg">General Shipment Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="serviceType">Service Type</Label>
                      <Select value={formData.serviceType} onValueChange={(value) => setFormData({ ...formData, serviceType: value })}>
                        <SelectTrigger><SelectValue placeholder="Select service" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Standard">Standard</SelectItem>
                          <SelectItem value="Express">Express</SelectItem>
                          <SelectItem value="Premium">Premium</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="origin">Origin</Label>
                      <Input id="origin" value={formData.origin} onChange={(e) => setFormData({ ...formData, origin: e.target.value })} placeholder="e.g., New York, USA" required />
                    </div>
                    <div>
                      <Label htmlFor="destination">Destination</Label>
                      <Input id="destination" value={formData.destination} onChange={(e) => setFormData({ ...formData, destination: e.target.value })} placeholder="e.g., 123 Main St, LA, CA" required />
                    </div>
                    <div>
                      <Label htmlFor="estimatedDelivery">Estimated Delivery</Label>
                      <Input id="estimatedDelivery" type="date" value={formData.estimatedDelivery} onChange={(e) => setFormData({ ...formData, estimatedDelivery: e.target.value })} required />
                    </div>
                    <div>
                      <Label htmlFor="shipmentValue">Shipment Value (USDT)</Label>
                      <Input id="shipmentValue" type="number" value={formData.shipmentValue} onChange={(e) => setFormData({ ...formData, shipmentValue: e.target.value })} placeholder="e.g., 10000" required />
                    </div>
                    <div>
                      <Label htmlFor="currentLocation">Current Location</Label>
                      <Input id="currentLocation" value={formData.currentLocation} onChange={(e) => setFormData({ ...formData, currentLocation: e.target.value })} placeholder="e.g., Kansas City, MO" required />
                    </div>
                    <div>
                      <Label htmlFor="customsStatus">Customs Status</Label>
                      <Select value={formData.customsStatus} onValueChange={(value) => setFormData({ ...formData, customsStatus: value })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Cleared">Cleared</SelectItem>
                          <SelectItem value="On Hold">On Hold</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Additional Shipment Details Section */}
                <div className="space-y-4 border p-4 rounded-lg">
                  <h4 className="font-semibold text-lg">Shipment Specifications</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="typeOfShipment">Type of Shipment</Label>
                      <Input id="typeOfShipment" value={formData.typeOfShipment} onChange={(e) => setFormData({ ...formData, typeOfShipment: e.target.value })} placeholder="e.g., Air Freight" required />
                    </div>
                    <div>
                      <Label htmlFor="weight">Weight</Label>
                      <Input id="weight" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} placeholder="e.g., 15kg" required />
                    </div>
                    <div>
                      <Label htmlFor="product">Product</Label>
                      <Input id="product" value={formData.product} onChange={(e) => setFormData({ ...formData, product: e.target.value })} placeholder="e.g., Electronics" required />
                    </div>
                    <div>
                      <Label htmlFor="paymentMethod">Payment Method</Label>
                      <Input id="paymentMethod" value={formData.paymentMethod} onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })} placeholder="e.g., Credit Card / Wire" required />
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button type="submit" className="w-full md:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Shipment
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* All Shipments Table Card */}
          <Card>
            <CardHeader>
              <CardTitle>All Shipments</CardTitle>
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
                              <TableCell className="text-sm">{shipment.origin}</TableCell>
                              <TableCell className="text-sm max-w-[200px] truncate">{shipment.destination}</TableCell>
                              <TableCell>
                                <Badge variant="secondary">{shipment.status}</Badge>
                              </TableCell>
                              <TableCell>${shipment.shipment_value.toLocaleString()}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {/* Button to open Edit Shipment Dialog (General info) */}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openEditDialog(shipment)}
                                    title="Edit General Info"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  {/* Button to open Progress Update Dialog (Timeline) */}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openProgressDialog(shipment)}
                                    title="Update Progress Timeline"
                                  >
                                    <Package className="h-4 w-4" />
                                  </Button>
                                  {/* Button to open View Shipment Dialog (Details) */}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleViewShipment(shipment)}
                                    title="View Details"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  {/* Button to Delete Shipment */}
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

      {/* --- */}
      {/* Progress Update Dialog */}
      {/* --- */}
      <Dialog open={isProgressDialogOpen} onOpenChange={setIsProgressDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Update Shipment Progress - **{selectedShipment?.tracking_id}**</DialogTitle>
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
                      <div className="text-xs text-gray-500 mt-1">📍 {step.location} | {new Date(step.timestamp).toLocaleString()}</div>
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
                  <Label>Status Type</Label>
                  <Select
                    value={newProgress.status}
                    onValueChange={(value) => {
                      setNewProgress({ 
                        ...newProgress, 
                        status: value,
                        // Pre-fill title and description for "Delivered"
                        title: value === "Delivered" ? "Delivered" : "",
                        description: value === "Delivered" ? "Shipment has been successfully delivered to the receiver." : ""
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="In Transit">Standard Update</SelectItem>
                      <SelectItem value="Delivered">Final Delivery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Title</Label>
                  <Input
                    value={newProgress.title}
                    onChange={(e) => setNewProgress({ ...newProgress, title: e.target.value })}
                    placeholder="e.g., In Transit"
                    disabled={newProgress.status === "Delivered"}
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newProgress.description}
                    onChange={(e) => setNewProgress({ ...newProgress, description: e.target.value })}
                    placeholder="e.g., In Transit to Next Facility November 3, 2025"
                  />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input
                    value={newProgress.location}
                    onChange={(e) => setNewProgress({ ...newProgress, location: e.target.value })}
                    placeholder="e.g., Kansas City, Missouri"
                    required
                  />
                </div>
                
                <Button onClick={handleAddProgressStep} type="button" className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Progress Step (Local)
                </Button>
              </div>
            </div>

            {/* Save Button (Consolidated update action) */}
            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsProgressDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleUpdateAndSaveProgress} className="flex-1">
                Save Progress
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- */}
      {/* Edit Shipment Dialog (General Details) */}
      {/* --- */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Shipment - **{editShipmentId}**</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateShipment} className="space-y-6">

            {/* Receiver Information Section - EDIT */}
            <div className="space-y-4 border p-4 rounded-lg">
              <h4 className="font-semibold text-lg">Receiver Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="editReceiverName">Receiver Name</Label>
                  <Input id="editReceiverName" value={editFormData.receiverName} onChange={(e) => setEditFormData({ ...editFormData, receiverName: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="editReceiverEmail">Receiver Email</Label>
                  <Input id="editReceiverEmail" type="email" value={editFormData.receiverEmail} onChange={(e) => setEditFormData({ ...editFormData, receiverEmail: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="editReceiverPhone">Receiver Phone</Label>
                  <Input id="editReceiverPhone" type="tel" value={editFormData.receiverPhone} onChange={(e) => setEditFormData({ ...editFormData, receiverPhone: e.target.value })} required />
                </div>
              </div>
            </div>

            {/* Basic Shipment Details - EDIT */}
            <div className="space-y-4 border p-4 rounded-lg">
              <h4 className="font-semibold text-lg">General Shipment Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="editServiceType">Service Type</Label>
                  <Select value={editFormData.serviceType} onValueChange={(value) => setEditFormData({ ...editFormData, serviceType: value })}>
                    <SelectTrigger id="editServiceType"><SelectValue placeholder="Select service" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Standard">Standard</SelectItem>
                      <SelectItem value="Express">Express</SelectItem>
                      <SelectItem value="Premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="editOrigin">Origin</Label>
                  <Input id="editOrigin" value={editFormData.origin} onChange={(e) => setEditFormData({ ...editFormData, origin: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="editDestination">Destination</Label>
                  <Input id="editDestination" value={editFormData.destination} onChange={(e) => setEditFormData({ ...editFormData, destination: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="editEstimatedDelivery">Estimated Delivery</Label>
                  <Input id="editEstimatedDelivery" type="date" value={editFormData.estimatedDelivery} onChange={(e) => setEditFormData({ ...editFormData, estimatedDelivery: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="editShipmentValue">Shipment Value (USDT)</Label>
                  <Input id="editShipmentValue" type="number" value={editFormData.shipmentValue} onChange={(e) => setEditFormData({ ...editFormData, shipmentValue: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="editCurrentLocation">Current Location</Label>
                  <Input id="editCurrentLocation" value={editFormData.currentLocation} onChange={(e) => setEditFormData({ ...editFormData, currentLocation: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="editCustomsStatus">Customs Status</Label>
                  <Select value={editFormData.customsStatus} onValueChange={(value) => setEditFormData({ ...editFormData, customsStatus: value })}>
                    <SelectTrigger id="editCustomsStatus"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cleared">Cleared</SelectItem>
                      <SelectItem value="On Hold">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="editStatus">Status</Label>
                  <Select value={editFormData.status} onValueChange={(value) => setEditFormData({ ...editFormData, status: value })}>
                    <SelectTrigger id="editStatus"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="In Transit">In Transit</SelectItem>
                      <SelectItem value="Out for Delivery">Out for Delivery</SelectItem>
                      <SelectItem value="Delivered">Delivered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Additional Shipment Details Section - EDIT */}
            <div className="space-y-4 border p-4 rounded-lg">
              <h4 className="font-semibold text-lg">Shipment Specifications</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="editTypeOfShipment">Type of Shipment</Label>
                  <Input id="editTypeOfShipment" value={editFormData.typeOfShipment} onChange={(e) => setEditFormData({ ...editFormData, typeOfShipment: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="editWeight">Weight</Label>
                  <Input id="editWeight" value={editFormData.weight} onChange={(e) => setEditFormData({ ...editFormData, weight: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="editProduct">Product</Label>
                  <Input id="editProduct" value={editFormData.product} onChange={(e) => setEditFormData({ ...editFormData, product: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="editPaymentMethod">Payment Method</Label>
                  <Input id="editPaymentMethod" value={editFormData.paymentMethod} onChange={(e) => setEditFormData({ ...editFormData, paymentMethod: e.target.value })} required />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Shipment Dialog (can be kept as is, but added the new fields for completeness) */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Shipment Details - **{viewShipment?.tracking_id}**</DialogTitle>
          </DialogHeader>
          {viewShipment && (
            <div className="space-y-4 text-sm">
              {/* Receiver Info */}
              <h4 className="font-semibold text-base border-b pb-1">Receiver Details</h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <p><strong>Name:</strong> {viewShipment.receiver_name}</p>
                <p><strong>Email:</strong> {viewShipment.receiver_email}</p>
                <p><strong>Phone:</strong> {viewShipment.receiver_phone}</p>
              </div>

              {/* Basic Info */}
              <h4 className="font-semibold text-base border-b pb-1 pt-4">Shipment Overview</h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <p><strong>Status:</strong> <Badge>{viewShipment.status}</Badge></p>
                <p><strong>Service Type:</strong> {viewShipment.service_type}</p>
                <p><strong>Origin:</strong> {viewShipment.origin}</p>
                <p><strong>Destination:</strong> {viewShipment.destination}</p>
                <p><strong>Estimated Delivery:</strong> {viewShipment.estimated_delivery}</p>
                <p><strong>Value (USDT):</strong> ${viewShipment.shipment_value.toLocaleString()}</p>
                <p><strong>Current Location:</strong> {viewShipment.current_location}</p>
                <p><strong>Customs Status:</strong> {viewShipment.customs_status}</p>
              </div>

              {/* Specs Info */}
              <h4 className="font-semibold text-base border-b pb-1 pt-4">Shipment Specifications</h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <p><strong>Type:</strong> {viewShipment.type_of_shipment}</p>
                <p><strong>Weight:</strong> {viewShipment.weight}</p>
                <p><strong>Product:</strong> {viewShipment.product}</p>
                <p><strong>Payment:</strong> {viewShipment.payment_method}</p>
              </div>

              {/* Progress Timeline */}
              <h4 className="font-semibold text-base border-b pb-1 pt-4">Progress Timeline</h4>
              <div className="space-y-2">
                {viewShipment.progress.map((step, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    <Badge variant={step.completed ? "default" : "secondary"}>{step.completed ? "✅" : "⏳"}</Badge>
                    <div>
                      <p className="font-medium">{step.title} <span className="text-xs text-gray-500 ml-2">({new Date(step.timestamp).toLocaleString()})</span></p>
                      <p className="text-gray-600">{step.description} at {step.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
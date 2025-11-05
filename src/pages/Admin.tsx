import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Trash2, Plus, LogOut, Eye, Edit } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

// API base URL - replace with your Node.js backend URL
const API_BASE_URL = "https://fed-bank.vercel.app/api";

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
  const [formData, setFormData] = useState({
    serviceType: "",
    origin: "",
    destination: "",
    estimatedDelivery: "",
    shipmentValue: "",
    currentLocation: "",
    customsStatus: "On Hold",
  });
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewShipment, setViewShipment] = useState<Shipment | null>(null);


  // Progress update state
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

    if (!formData.serviceType || !formData.origin || !formData.destination || !formData.estimatedDelivery || !formData.shipmentValue || !formData.currentLocation) {
      toast.error("Please fill in all required fields");
      return;
    }

    const trackingId = generateTrackingId();
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
        }),
      });

      if (!response.ok) {
        toast.error("Error creating shipment");
      } else {
        toast.success(`Shipment created! Tracking ID: ${trackingId}`);
        setFormData({
          serviceType: "",
          origin: "",
          destination: "",
          estimatedDelivery: "",
          shipmentValue: "",
          currentLocation: "",
          customsStatus: "On Hold",
        });
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

  const handleUpdateProgress = async () => {
    if (!selectedShipment) return;

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
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">FedEx Ship Center</h1>
          <Button variant="outline" onClick={() => setIsLoggedIn(false)}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      <main className="py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Admin Panel</h2>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Create New Shipment</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateShipment} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <Label htmlFor="origin">Origin</Label>
                    <Input
                      id="origin"
                      value={formData.origin}
                      onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                      placeholder="e.g., New York, USA"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="destination">Destination</Label>
                    <Input
                      id="destination"
                      value={formData.destination}
                      onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                      placeholder="e.g., 123 Main St, Los Angeles, CA"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="estimatedDelivery">Estimated Delivery</Label>
                    <Input
                      id="estimatedDelivery"
                      type="date"
                      value={formData.estimatedDelivery}
                      onChange={(e) => setFormData({ ...formData, estimatedDelivery: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="shipmentValue">Shipment Value (USDT)</Label>
                    <Input
                      id="shipmentValue"
                      type="number"
                      value={formData.shipmentValue}
                      onChange={(e) => setFormData({ ...formData, shipmentValue: e.target.value })}
                      placeholder="e.g., 10000"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="currentLocation">Current Location</Label>
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

                <Button type="submit" className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Shipment
                </Button>
              </form>
            </CardContent>
          </Card>

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
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openProgressDialog(shipment)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleViewShipment(shipment)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteShipment(shipment.id)}
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
                    placeholder="e.g., In Transit to Next Facility November 3, 2025"
                  />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input
                    value={newProgress.location}
                    onChange={(e) => setNewProgress({ ...newProgress, location: e.target.value })}
                    placeholder="e.g., Kansas City, Missouri – major trucking corridor toward Texas and Louisiana"
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
                <Button onClick={handleAddProgressStep} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Progress Step
                </Button>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsProgressDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleUpdateProgress} className="flex-1">
                Save Progress
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Shipment Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Shipment Details</DialogTitle>
          </DialogHeader>

          {viewShipment ? (
            <div className="space-y-3 text-sm">
              <div><strong>Tracking ID:</strong> {viewShipment.tracking_id}</div>
              <div><strong>Service Type:</strong> {viewShipment.service_type}</div>
              <div><strong>Origin:</strong> {viewShipment.origin}</div>
              <div><strong>Destination:</strong> {viewShipment.destination}</div>
              <div><strong>Estimated Delivery:</strong> {viewShipment.estimated_delivery}</div>
              <div><strong>Shipment Value:</strong> ${viewShipment.shipment_value.toLocaleString()}</div>
              <div><strong>Current Location:</strong> {viewShipment.current_location}</div>
              <div><strong>Customs Status:</strong> {viewShipment.customs_status}</div>
              <div><strong>Status:</strong> {viewShipment.status}</div>

              <div className="pt-2">
                <strong>Progress:</strong>
                <ul className="mt-1 list-disc list-inside text-gray-600">
                  {viewShipment.progress.map((step, index) => (
                    <li key={index}>
                      <span className="font-medium">{step.title}</span> — {step.location}
                      {step.completed && <span className="text-green-600 ml-1">(Completed)</span>}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 text-right">
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
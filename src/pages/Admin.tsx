import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Truck, CheckCircle, Package } from 'lucide-react';

// --- Local Storage Keys ---
const SHIPMENTS_STORAGE_KEY = 'shipment_tracker_shipments';
const USER_STORAGE_KEY = 'shipment_tracker_user';

// Helper to generate a unique ID
const generateId = () => Math.random().toString(36).substring(2, 10).toUpperCase();

// Helper to determine text color for status tags
const getStatusColor = (status) => {
    status = status.toLowerCase();
    if (status.includes('delivered')) return 'bg-green-100 text-green-700 ring-green-600/20';
    if (status.includes('transit')) return 'bg-blue-100 text-blue-700 ring-blue-600/20';
    if (status.includes('processing')) return 'bg-yellow-100 text-yellow-700 ring-yellow-600/20';
    if (status.includes('pending')) return 'bg-gray-100 text-gray-700 ring-gray-600/20';
    if (status.includes('failed')) return 'bg-red-100 text-red-700 ring-red-600/20';
    return 'bg-indigo-100 text-indigo-700 ring-indigo-600/20';
};

// --- Main Application Component ---
const App = () => {
    // --- Local State Setup ---
    const [userId, setUserId] = useState(null);
    const [shipments, setShipments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    // Modal State
    const [isShipmentModalOpen, setIsShipmentModalOpen] = useState(false);
    const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
    const [currentShipment, setCurrentShipment] = useState(null);

    // Form State (New/Edit Shipment)
    const [formData, setFormData] = useState({
        trackingId: '', origin: '', destination: '',
        receiverName: '', receiverEmail: '', receiverPhone: '',
        shipmentType: 'Standard', weight: '', product: '', paymentMethod: 'Card',
    });

    // Form State (Progress Update)
    const [progressData, setProgressData] = useState({
        status: 'In Transit', location: '', notes: '', isDelivered: false
    });

    // 1. SIMULATED AUTHENTICATION & INITIAL DATA LOAD (from localStorage)
    useEffect(() => {
        // 1a. Load/Generate User ID (Simulated Login)
        let savedUserId = localStorage.getItem(USER_STORAGE_KEY);
        if (!savedUserId) {
            savedUserId = `anon_${generateId()}`;
            localStorage.setItem(USER_STORAGE_KEY, savedUserId);
        }
        setUserId(savedUserId);

        // 1b. Load Shipments
        try {
            const storedShipments = localStorage.getItem(SHIPMENTS_STORAGE_KEY);
            if (storedShipments) {
                const loadedShipments = JSON.parse(storedShipments);
                // Ensure progress arrays are sorted for consistency
                const sortedShipments = loadedShipments.map(s => ({
                    ...s,
                    progress: Array.isArray(s.progress)
                        ? s.progress.sort((a, b) => b.timestamp - a.timestamp)
                        : []
                }));
                setShipments(sortedShipments);
            }
        } catch (error) {
            console.error("Error loading shipments from local storage:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // 2. DATA PERSISTENCE (Save shipments to localStorage whenever the state changes)
    useEffect(() => {
        if (!isLoading) {
            try {
                // Only save the current user's data
                localStorage.setItem(SHIPMENTS_STORAGE_KEY, JSON.stringify(shipments));
            } catch (error) {
                console.error("Error saving shipments to local storage:", error);
            }
        }
    }, [shipments, isLoading]);


    // 3. CRUD Operations

    // Open Add/Edit Modal
    const openShipmentModal = (shipmentToEdit = null) => {
        setCurrentShipment(shipmentToEdit);
        if (shipmentToEdit) {
            // Populate form with existing data
            setFormData({
                trackingId: shipmentToEdit.trackingId || '',
                origin: shipmentToEdit.origin || '',
                destination: shipmentToEdit.destination || '',
                receiverName: shipmentToEdit.receiverName || '',
                receiverEmail: shipmentToEdit.receiverEmail || '',
                receiverPhone: shipmentToEdit.receiverPhone || '',
                shipmentType: shipmentToEdit.shipmentType || 'Standard',
                weight: shipmentToEdit.weight || '',
                product: shipmentToEdit.product || '',
                paymentMethod: shipmentToEdit.paymentMethod || 'Card',
            });
        } else {
            // Reset form for new shipment
            setFormData({
                trackingId: generateId(),
                origin: '', destination: '',
                receiverName: '', receiverEmail: '', receiverPhone: '',
                shipmentType: 'Standard', weight: '', product: '', paymentMethod: 'Card',
            });
        }
        setIsShipmentModalOpen(true);
    };

    // Save/Update Shipment (Core Details)
    const saveShipment = async (e) => {
        e.preventDefault();
        
        // Simple validation
        if (!formData.trackingId || !formData.destination || !formData.receiverName) {
            console.error("Tracking ID, Destination, and Receiver Name are required.");
            return;
        }

        setIsSaving(true);
        const now = Date.now();
        const payload = {
            ...formData,
            weight: String(formData.weight),
            updatedAt: now,
        };

        if (currentShipment) {
            // UPDATE existing shipment
            setShipments(prevShipments => prevShipments.map(s => 
                s.id === currentShipment.id ? { ...s, ...payload } : s
            ));
        } else {
            // ADD new shipment
            const newShipment = {
                ...payload,
                id: generateId(),
                createdAt: now,
                progress: [{
                    timestamp: now,
                    status: 'Processing',
                    location: payload.origin,
                    notes: 'Shipment created and awaiting processing.',
                }],
            };
            setShipments(prevShipments => [newShipment, ...prevShipments]);
        }

        setIsSaving(false);
        setIsShipmentModalOpen(false);
    };

    // Delete Shipment
    const deleteShipment = (id) => {
        // NOTE: Using custom modal for confirmation is recommended, but using window.confirm for simplicity
        if (!window.confirm("Are you sure you want to delete this shipment?")) return;

        setShipments(prevShipments => prevShipments.filter(s => s.id !== id));
    };

    // 4. Progress Update Logic

    // Open Progress Modal
    const openProgressDialog = (shipment) => {
        setCurrentShipment(shipment);
        // Reset progress form
        setProgressData({ status: 'In Transit', location: '', notes: '', isDelivered: false });
        setIsProgressModalOpen(true);
    };

    // Save Progress (Consolidated function)
    const saveProgress = async (e) => {
        e.preventDefault();
        if (!currentShipment) return;

        setIsSaving(true);

        try {
            let newStatus = progressData.status;
            let notes = progressData.notes;
            let location = progressData.location;

            // If "Delivered" is checked, override status and notes
            if (progressData.isDelivered) {
                newStatus = 'Delivered';
                notes = notes || `Final delivery confirmed at ${location || currentShipment.destination}.`;
                location = location || currentShipment.destination;
            } else if (!location) {
                 // Simple validation for non-delivered status
                 console.error("Location is required for status updates.");
                 setIsSaving(false);
                 return;
            }

            const newProgressEntry = {
                timestamp: Date.now(),
                status: newStatus,
                location: location,
                notes: notes,
            };

            // Update state immutably
            setShipments(prevShipments => prevShipments.map(s => {
                if (s.id === currentShipment.id) {
                    const updatedProgress = [newProgressEntry, ...(s.progress || [])];
                    return {
                        ...s,
                        progress: updatedProgress.sort((a, b) => b.timestamp - a.timestamp),
                        updatedAt: Date.now(),
                    };
                }
                return s;
            }));

            setIsProgressModalOpen(false);
        } catch (error) {
            console.error("Error updating progress:", error);
        } finally {
            setIsSaving(false);
        }
    };

    // --- Utility Components (for cleaner JSX) ---

    // Generic Modal Component
    const Modal = ({ title, isOpen, onClose, children }) => {
        if (!isOpen) return null;
        return (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-70 flex items-center justify-center p-4" aria-modal="true" role="dialog">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl mx-auto transform transition-all p-6">
                    <div className="flex justify-between items-center mb-4 border-b pb-3">
                        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-full transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    {children}
                </div>
            </div>
        );
    };

    // Main Shipment Card Component
    const ShipmentCard = ({ shipment }) => {
        const latestProgress = shipment.progress[0] || { status: 'Unknown', location: 'N/A' };
        const isDelivered = latestProgress.status.toLowerCase() === 'delivered';

        return (
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-5 ring-1 ring-gray-100 flex flex-col sm:flex-row justify-between gap-4 mb-4">
                <div className="flex-grow">
                    <div className="flex items-center mb-2">
                        <Package className="h-5 w-5 text-indigo-500 mr-2" />
                        <h4 className="text-sm font-semibold text-gray-400">
                            ID: <span className="text-indigo-600 text-lg font-extrabold tracking-wider">{shipment.trackingId}</span>
                        </h4>
                    </div>

                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                        <p className="text-gray-500">
                            **From:** <span className="font-medium text-gray-800">{shipment.origin}</span>
                        </p>
                        <p className="text-gray-500">
                            **To:** <span className="font-medium text-gray-800">{shipment.destination}</span>
                        </p>
                        <p className="text-gray-500">
                            **Receiver:** <span className="font-medium text-gray-800">{shipment.receiverName}</span>
                        </p>
                        <p className="text-gray-500">
                            **Product:** <span className="font-medium text-gray-800">{shipment.product}</span>
                        </p>
                        <p className="text-gray-500">
                            **Type:** <span className="font-medium text-gray-800">{shipment.shipmentType}</span>
                        </p>
                        <p className="text-gray-500">
                            **Weight:** <span className="font-medium text-gray-800">{shipment.weight} kg</span>
                        </p>
                    </div>
                </div>

                <div className="w-full sm:w-1/3 border-t sm:border-t-0 sm:border-l pt-4 sm:pt-0 sm:pl-4">
                    <p className="text-xs font-medium text-gray-400 mb-1">Current Status</p>
                    <div className="flex items-center mb-3">
                        {isDelivered ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        ) : (
                            <Truck className="h-5 w-5 text-blue-500 mr-2" />
                        )}
                        <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ring-1 ring-inset ${getStatusColor(latestProgress.status)}`}>
                            {latestProgress.status}
                        </span>
                    </div>

                    <p className="text-xs text-gray-500 mb-4">
                        <span className="font-medium text-gray-800">{latestProgress.location}</span>
                        {latestProgress.timestamp ? ` (${new Date(latestProgress.timestamp).toLocaleDateString()})` : ''}
                    </p>

                    <div className="flex space-x-2">
                        <Button
                            variant="primary"
                            onClick={() => openProgressDialog(shipment)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            title="Update Progress"
                        >
                            <Truck className="h-4 w-4 mr-2" /> Progress
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => openShipmentModal(shipment)}
                            title="Edit Core Details"
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="danger"
                            onClick={() => deleteShipment(shipment.id)}
                            title="Delete Shipment"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        );
    };

    // Custom Button Component (for visual appeal and consistency)
    const Button = ({ children, onClick, variant = 'primary', className = '', type = 'button', disabled = false, title = '' }) => {
        let baseStyle = 'inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200';
        let style = '';

        switch (variant) {
            case 'primary':
                style = 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500';
                break;
            case 'secondary':
                style = 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300 focus:ring-indigo-500';
                break;
            case 'danger':
                style = 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-400';
                break;
            case 'ghost':
                style = 'bg-transparent text-gray-500 hover:bg-gray-100 focus:ring-transparent p-2 h-auto';
                break;
            default:
                style = 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500';
        }

        if (disabled) {
            style = 'bg-gray-400 text-gray-200 cursor-not-allowed';
        }

        return (
            <button
                type="submit"
                onClick={onClick}
                className={`${baseStyle} ${style} ${className}`}
                disabled={disabled}
                title={title}
            >
                {children}
            </button>
        );
    };

    // --- RENDER LOGIC ---

    if (isLoading || !userId) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <p className="ml-3 text-lg text-gray-600">Loading Data...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans p-4 sm:p-8">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-4 border-b border-gray-200">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-2 sm:mb-0 flex items-center">
                    <Truck className="h-8 w-8 text-indigo-600 mr-3" /> Shipment Manager
                </h1>
                <div className="text-right">
                     <p className="text-xs text-gray-500">Current User ID:</p>
                     <p className="text-sm font-mono text-gray-700 break-all">{userId}</p>
                </div>
            </header>

            <div className="flex justify-end mb-6">
                <Button
                    variant="primary"
                    onClick={() => openShipmentModal(null)}
                    className="shadow-lg hover:shadow-xl"
                >
                    <Plus className="h-5 w-5 mr-2" /> Add Shipment
                </Button>
            </div>

            <div className="space-y-4">
                {shipments.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-xl shadow-lg ring-1 ring-gray-100">
                        <p className="text-lg text-gray-500">No shipments found. Start by adding one!</p>
                    </div>
                ) : (
                    shipments.map(shipment => (
                        <ShipmentCard key={shipment.id} shipment={shipment} />
                    ))
                )}
            </div>

            {/* --- ADD/EDIT SHIPMENT MODAL --- */}
            <Modal
                title={currentShipment ? 'Edit Shipment Details' : 'Add New Shipment'}
                isOpen={isShipmentModalOpen}
                onClose={() => setIsShipmentModalOpen(false)}
            >
                <form onSubmit={saveShipment} className="space-y-4">
                    <h4 className="text-md font-semibold text-indigo-600 pt-2 border-t mt-4">Core Tracking Details</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <label className="block">
                            <span className="text-gray-700 font-medium">Tracking ID</span>
                            <input
                                type="text"
                                required
                                value={formData.trackingId}
                                onChange={(e) => setFormData({ ...formData, trackingId: e.target.value })}
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 border focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                                readOnly={!!currentShipment} // ID is read-only when editing
                            />
                        </label>
                        <label className="block">
                            <span className="text-gray-700 font-medium">Shipment Type</span>
                            <select
                                required
                                value={formData.shipmentType}
                                onChange={(e) => setFormData({ ...formData, shipmentType: e.target.value })}
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 border focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                            >
                                <option>Standard</option>
                                <option>Express</option>
                                <option>Freight</option>
                            </select>
                        </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <label className="block">
                            <span className="text-gray-700 font-medium">Origin</span>
                            <input
                                type="text"
                                required
                                value={formData.origin}
                                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 border focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                            />
                        </label>
                        <label className="block">
                            <span className="text-gray-700 font-medium">Destination</span>
                            <input
                                type="text"
                                required
                                value={formData.destination}
                                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 border focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                            />
                        </label>
                    </div>

                    <h4 className="text-md font-semibold text-indigo-600 pt-4 border-t mt-4">Product Details</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <label className="block">
                            <span className="text-gray-700 font-medium">Product Name</span>
                            <input
                                type="text"
                                required
                                value={formData.product}
                                onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 border focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                            />
                        </label>
                        <label className="block">
                            <span className="text-gray-700 font-medium">Weight (kg)</span>
                            <input
                                type="number"
                                required
                                min="0.1"
                                step="0.1"
                                value={formData.weight}
                                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 border focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                            />
                        </label>
                    </div>

                    <h4 className="text-md font-semibold text-indigo-600 pt-4 border-t mt-4">Receiver & Payment</h4>
                    <label className="block">
                        <span className="text-gray-700 font-medium">Receiver Name</span>
                        <input
                            type="text"
                            required
                            value={formData.receiverName}
                            onChange={(e) => setFormData({ ...formData, receiverName: e.target.value })}
                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 border focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                        />
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <label className="block">
                            <span className="text-gray-700 font-medium">Receiver Email</span>
                            <input
                                type="email"
                                value={formData.receiverEmail}
                                onChange={(e) => setFormData({ ...formData, receiverEmail: e.target.value })}
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 border focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                            />
                        </label>
                        <label className="block">
                            <span className="text-gray-700 font-medium">Receiver Phone</span>
                            <input
                                type="tel"
                                value={formData.receiverPhone}
                                onChange={(e) => setFormData({ ...formData, receiverPhone: e.target.value })}
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 border focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                            />
                        </label>
                    </div>

                    <label className="block">
                        <span className="text-gray-700 font-medium">Payment Method</span>
                        <select
                            required
                            value={formData.paymentMethod}
                            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 border focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                        >
                            <option>Card</option>
                            <option>Cash on Delivery</option>
                            <option>Bank Transfer</option>
                        </select>
                    </label>

                    <div className="flex justify-end pt-4 space-x-3">
                        <Button
                            variant="secondary"
                            onClick={() => setIsShipmentModalOpen(false)}
                            disabled={isSaving}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            onClick={() => {}} // Fix: Added onClick for required prop
                            variant="primary"
                            disabled={isSaving}
                        >
                            {isSaving ? 'Saving...' : (currentShipment ? 'Save Changes' : 'Create Shipment')}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* --- PROGRESS UPDATE MODAL --- */}
            <Modal
                title={`Update Progress for ID: ${currentShipment?.trackingId || ''}`}
                isOpen={isProgressModalOpen}
                onClose={() => setIsProgressModalOpen(false)}
            >
                <form onSubmit={saveProgress} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <label className="block">
                            <span className="text-gray-700 font-medium">Status</span>
                            <select
                                required
                                value={progressData.status}
                                onChange={(e) => setProgressData({ ...progressData, status: e.target.value, isDelivered: e.target.value === 'Delivered' })}
                                disabled={progressData.isDelivered}
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 border focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 disabled:bg-gray-100"
                            >
                                <option>Processing</option>
                                <option>In Transit</option>
                                <option>Out for Delivery</option>
                                <option>Delivery Failed</option>
                                {/* Note: 'Delivered' is usually set via the checkbox/final action, but included here for manual override */}
                                <option>Delivered</option>
                            </select>
                        </label>
                        <label className="block">
                            <span className="text-gray-700 font-medium">Location</span>
                            <input
                                type="text"
                                required={!progressData.isDelivered} // Location not required if Delivered is checked
                                value={progressData.location}
                                onChange={(e) => setProgressData({ ...progressData, location: e.target.value })}
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 border focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                                placeholder={progressData.isDelivered ? 'Defaults to Destination' : 'City or Hub Name'}
                                disabled={progressData.isDelivered && currentShipment?.destination} // Lock field if delivered and destination known
                            />
                        </label>
                    </div>

                    <label className="block">
                        <span className="text-gray-700 font-medium">Notes (Internal)</span>
                        <textarea
                            value={progressData.notes}
                            onChange={(e) => setProgressData({ ...progressData, notes: e.target.value })}
                            rows={3} // Fix: Changed from string "3" to number {3}
                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 border focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                            placeholder="Add internal notes or customer communication details..."
                        ></textarea>
                    </label>

                    <div className="flex items-center pt-2">
                        <input
                            id="delivered-checkbox"
                            type="checkbox"
                            checked={progressData.isDelivered}
                            onChange={(e) => setProgressData({
                                ...progressData,
                                isDelivered: e.target.checked,
                                status: e.target.checked ? 'Delivered' : progressData.status, // Preserve status if unchecked, unless it was 'Delivered'
                                location: e.target.checked ? currentShipment?.destination || '' : progressData.location
                            })}
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <label htmlFor="delivered-checkbox" className="ml-2 block text-sm font-medium text-gray-700 flex items-center">
                            Mark as **Delivered** <CheckCircle className="h-4 w-4 ml-2 text-green-600" />
                        </label>
                    </div>


                    <div className="flex justify-end pt-4 space-x-3 border-t">
                        <Button
                            variant="secondary"
                            onClick={() => setIsProgressModalOpen(false)}
                            disabled={isSaving}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            onClick={() => {}} // Fix: Added onClick for required prop
                            variant="primary"
                            disabled={isSaving}
                        >
                            {isSaving ? 'Saving...' : 'Save Progress'}
                        </Button>
                    </div>
                </form>

                {/* Progress History View */}
                {currentShipment && (
                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <h4 className="text-lg font-bold mb-3 text-gray-800">Tracking History</h4>
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                            {currentShipment.progress.map((entry, index) => (
                                <div key={index} className="flex space-x-3">
                                    <div className="relative">
                                        <div className={`h-3 w-3 rounded-full ${index === 0 ? 'bg-indigo-500 ring-4 ring-indigo-200' : 'bg-gray-300'}`}></div>
                                        {index < currentShipment.progress.length - 1 && (
                                            <div className="absolute top-3 left-1/2 w-0.5 h-full bg-gray-200 -translate-x-1/2"></div>
                                        )}
                                    </div>
                                    <div className="pb-4">
                                        <p className="text-sm font-semibold text-gray-800">{entry.status}</p>
                                        <p className="text-xs text-gray-600">{entry.location} - {new Date(entry.timestamp).toLocaleString()}</p>
                                        {entry.notes && <p className="text-xs text-gray-500 italic mt-0.5">Notes: {entry.notes}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default App;
"use client";

import { useState, useEffect } from "react";
import { riderService } from "../services/api";
import Navbar from "../components/Navbar";
import Spinner from "../components/Spinner";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Alert } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { getRiderStatus, updateStatus, getDeliveryRequests, acceptDeliveryRequest, declineDeliveryRequest, getActiveDelivery, updateDeliveryStatus } from '../services/rider.service';

const DELIVERY_STATUSES = [
  { value: 'picked_up', label: 'Picked Up from Restaurant' },
  { value: 'in_transit', label: 'In Transit' },
  { value: 'near_delivery', label: 'Near Delivery Location' },
  { value: 'delivered', label: 'Delivered' }
];

const RiderDashboard = () => {
  const [deliveryRequests, setDeliveryRequests] = useState([]);
  const [activeDelivery, setActiveDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState("");
  const [riderStatus, setRiderStatus] = useState("offline");
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [status, setStatus] = useState('');

  // Fetch delivery requests, active delivery, and rider status on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(""); // Clear any existing errors
        console.log("Fetching rider status...");
        
        // Fetch rider status
        const riderData = await getRiderStatus();
        console.log("Rider status response:", riderData);
        
        if (riderData && riderData.status) {
          const status = riderData.status.toLowerCase();
          console.log("Setting rider status to:", status);
          
          // If rider is busy, verify there's actually an active delivery
          if (status === "busy") {
            try {
              const activeDeliveryData = await getActiveDelivery();
              console.log("Active delivery check:", activeDeliveryData);
              
              if (!activeDeliveryData || activeDeliveryData.message === "No active delivery found") {
                // No active delivery found, correct the status to available
                console.log("No active delivery found, correcting rider status to available");
                await updateStatus("available");
                setRiderStatus("available");
                
                // Fetch available delivery requests
                const requests = await getDeliveryRequests();
                setDeliveryRequests(requests || []);
              } else {
                setRiderStatus(status);
                setActiveDelivery(activeDeliveryData);
              }
            } catch (deliveryError) {
              console.error("Error checking active delivery:", deliveryError);
              if (deliveryError.response?.status === 404) {
                // No active delivery found, correct the status
                console.log("No active delivery found (404), correcting rider status to available");
                await updateStatus("available");
                setRiderStatus("available");
                
                // Fetch available delivery requests
                const requests = await getDeliveryRequests();
                setDeliveryRequests(requests || []);
              }
            }
          } else {
            setRiderStatus(status);
            if (status === "available") {
              // Fetch delivery requests if rider is available
              console.log("Fetching delivery requests...");
              const response = await getDeliveryRequests();
              console.log("Delivery requests response:", response);
              setDeliveryRequests(response || []);
            }
          }
        } else {
          console.error("Invalid rider status response:", riderData);
          setError("Failed to get rider status");
        }
      } catch (err) {
        console.error("Failed to fetch data", err);
        setError(err.response?.data?.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchActiveDelivery = async () => {
      try {
        console.log('Fetching active delivery...');
        const data = await getActiveDelivery();
        console.log('Active delivery data:', data);
        setActiveDelivery(data);
      } catch (error) {
        console.error('Error fetching active delivery:', error);
        setError('Failed to fetch active delivery');
      }
    };

    if (riderStatus === 'busy') {
      fetchActiveDelivery();
    } else {
      setActiveDelivery(null);
    }
  }, [riderStatus]);

  const handleStatusChange = async (newStatus) => {
    try {
      setError(""); // Clear any existing errors
      console.log("Updating status to:", newStatus);
      
      await updateStatus(newStatus);
      setRiderStatus(newStatus);
      setNotification(`Status updated to ${newStatus}`);

      if (newStatus === "offline") {
        setDeliveryRequests([]);
        setActiveDelivery(null);
      } else if (newStatus === "available") {
        // If going online, fetch delivery requests
        console.log("Fetching delivery requests after status change...");
        const requests = await getDeliveryRequests();
        console.log("Delivery requests after status change:", requests);
        setDeliveryRequests(requests || []);
      }
    } catch (err) {
      console.error("Failed to update status", err);
      setError(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleAcceptRequest = async (orderId) => {
    try {
      setError(""); // Clear any existing errors
      console.log("Accepting delivery request:", orderId);
      const response = await acceptDeliveryRequest(orderId);
      console.log("Accept request response:", response);
      
      setNotification("Delivery request accepted successfully!");
      setActiveDelivery(response.order);
      setDeliveryRequests([]);
      setRiderStatus("busy");
    } catch (err) {
      console.error("Failed to accept delivery request", err);
      // Show specific error message from the backend if available
      const errorMessage = err.response?.data?.message || "Failed to accept delivery request";
      setError(errorMessage);
      
      // If the error is due to order being taken, refresh the delivery requests
      if (err.response?.status === 400) {
        try {
          const requests = await getDeliveryRequests();
          setDeliveryRequests(requests || []);
        } catch (refreshError) {
          console.error("Failed to refresh delivery requests", refreshError);
        }
      }
    }
  };

  const handleDeclineRequest = async (orderId) => {
    try {
      setError(""); // Clear any existing errors
      console.log("Declining delivery request:", orderId);
      const response = await riderService.declineDeliveryRequest(orderId);
      console.log("Decline request response:", response);
      
      setNotification("Delivery request declined.");
      setDeliveryRequests((prev) =>
        prev.filter((request) => request._id !== orderId)
      );
    } catch (err) {
      console.error("Failed to decline delivery request", err);
      setError(err.response?.data?.message || "Failed to decline delivery request");
    }
  };

  const handleCompleteDelivery = async () => {
    try {
      setError("");
      console.log("Completing delivery:", activeDelivery._id);
      await riderService.completeDelivery(activeDelivery._id);
      
      setNotification("Delivery completed successfully!");
      setActiveDelivery(null);
      setRiderStatus("available");
      
      // Fetch new delivery requests
      const requests = await riderService.getDeliveryRequests();
      setDeliveryRequests(requests || []);
    } catch (err) {
      console.error("Failed to complete delivery", err);
      setError(err.response?.data?.message || "Failed to complete delivery");
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      setError("");
      setStatusUpdateLoading(true);
      console.log("Updating delivery status to:", newStatus);
      console.log("Active delivery:", activeDelivery);
      
      if (!activeDelivery?._id) {
        throw new Error("No active delivery found");
      }

      const response = await updateDeliveryStatus(activeDelivery._id, newStatus);
      console.log("Status update response:", response);
      
      setNotification(`Delivery status updated to ${newStatus}`);
      
      // Update the active delivery with the new status
      setActiveDelivery(prev => ({
        ...prev,
        status: newStatus,
        statusHistory: [
          ...(prev.statusHistory || []),
          {
            status: newStatus,
            timestamp: new Date()
          }
        ]
      }));

      // If delivered, update rider status to available
      if (newStatus === 'delivered') {
        await updateStatus({ status: 'available' });
        setRiderStatus('available');
        setActiveDelivery(null);
        try {
          const requests = await getDeliveryRequests();
          setDeliveryRequests(requests || []);
        } catch (error) {
          console.error("Failed to fetch new delivery requests:", error);
        }
      }
    } catch (err) {
      console.error("Failed to update delivery status:", err);
      setError(err.response?.data?.message || "Failed to update delivery status");
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const renderActiveDelivery = () => {
    if (!activeDelivery) return null;

    return (
      <Card className="col-span-full">
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-semibold">
                  Active Delivery - Order #{activeDelivery._id.slice(-6).toUpperCase()}
                </h2>
                <p className="text-sm text-gray-600">
                  Restaurant: {activeDelivery.restaurant?.name}
                </p>
              </div>
              <Badge variant="secondary" className="capitalize">
                {activeDelivery.deliveryStatus?.replace('_', ' ') || 'Pending'}
              </Badge>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Update Delivery Status</h3>
              <div className="flex gap-4 flex-wrap">
                {DELIVERY_STATUSES.map((status) => (
                  <Button
                    key={status.value}
                    variant={activeDelivery.deliveryStatus === status.value ? "default" : "outline"}
                    onClick={() => handleStatusUpdate(status.value)}
                    disabled={
                      statusUpdateLoading ||
                      (activeDelivery.deliveryStatus === 'delivered') ||
                      (DELIVERY_STATUSES.findIndex(s => s.value === activeDelivery.deliveryStatus) >
                       DELIVERY_STATUSES.findIndex(s => s.value === status.value))
                    }
                  >
                    {status.label}
                  </Button>
                ))}
              </div>
              {activeDelivery.statusHistory && activeDelivery.statusHistory.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Status History</h4>
                  <div className="space-y-2">
                    {activeDelivery.statusHistory.map((history, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <span className="capitalize">{history.status.replace('_', ' ')}</span>
                        <span className="mx-2">•</span>
                        <span>{new Date(history.timestamp).toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Pickup Location:</h3>
                  <p className="text-gray-600">{activeDelivery.restaurant?.address}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Delivery Address:</h3>
                  <p className="text-gray-600">
                    {activeDelivery.deliveryAddress.street}, {activeDelivery.deliveryAddress.city}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Customer Details:</h3>
                  <p className="text-gray-600">
                    {activeDelivery.customer?.name}<br />
                    {activeDelivery.customer?.phone}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">Order Total:</h3>
                  <p className="text-gray-600">
                    ${activeDelivery.totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Order Items:</h3>
              <ul className="list-disc ml-6 text-gray-600">
                {activeDelivery.items.map((item) => (
                  <li key={item.menuItem}>
                    {item.name} x {item.quantity}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleCompleteDelivery}
                disabled={activeDelivery.deliveryStatus !== 'delivered'}
                className="w-full md:w-auto"
              >
                Complete Delivery
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) return <Spinner />;

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Rider Dashboard</h1>
          <div className="flex gap-2">
            <Button
              variant={riderStatus === "available" ? "default" : "outline"}
              onClick={() => handleStatusChange("available")}
              disabled={riderStatus === "busy"}
            >
              Go Online
            </Button>
            <Button
              variant={riderStatus === "offline" ? "default" : "outline"}
              onClick={() => handleStatusChange("offline")}
              disabled={riderStatus === "busy"}
            >
              Go Offline
            </Button>
          </div>
        </div>

        {notification && (
          <Alert className="mb-4">
            {notification}
          </Alert>
        )}
        {error && (
          <Alert variant="destructive" className="mb-4">
            {error}
          </Alert>
        )}

        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Status</h2>
          <div className="flex items-center">
            <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
              riderStatus === 'available' ? 'bg-green-500' :
              riderStatus === 'busy' ? 'bg-yellow-500' :
              'bg-red-500'
            }`}></span>
            <span className="text-gray-700 capitalize">{riderStatus}</span>
          </div>
        </div>

        {activeDelivery && (
          <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Active Delivery</h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <p><span className="font-semibold">Order ID:</span> {activeDelivery._id}</p>
                <p><span className="font-semibold">Restaurant:</span> {activeDelivery.restaurant?.name}</p>
                <p><span className="font-semibold">Customer:</span> {activeDelivery.customer?.name}</p>
                <p><span className="font-semibold">Delivery Address:</span> {
                  activeDelivery.deliveryAddress ? 
                  `${activeDelivery.deliveryAddress.street}, ${activeDelivery.deliveryAddress.city}, ${activeDelivery.deliveryAddress.state} ${activeDelivery.deliveryAddress.zipCode}` 
                  : 'No address provided'
                }</p>
                <p><span className="font-semibold">Current Status:</span> {activeDelivery.status}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Update Delivery Status</h3>
                <div className="flex flex-wrap gap-3">
                  {[
                    { value: 'picked_up', label: 'Picked Up from Restaurant' },
                    { value: 'in_transit', label: 'In Transit' },
                    { value: 'near_delivery', label: 'Near Delivery Location' },
                    { value: 'delivered', label: 'Delivered' }
                  ].map((status) => (
                    <Button
                      key={status.value}
                      onClick={() => handleStatusUpdate(status.value)}
                      disabled={
                        statusUpdateLoading ||
                        activeDelivery.status === 'delivered' ||
                        (activeDelivery.status === status.value)
                      }
                      variant={activeDelivery.status === status.value ? "default" : "outline"}
                      className={`${
                        activeDelivery.status === status.value ? 'bg-green-500' : ''
                      }`}
                    >
                      {status.label}
                    </Button>
                  ))}
                </div>
              </div>

              {activeDelivery.statusHistory && activeDelivery.statusHistory.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Status History</h3>
                  <div className="space-y-2">
                    {activeDelivery.statusHistory.map((history, index) => (
                      <div key={index} className="text-sm text-gray-600">
                        <span className="capitalize">{history.status.replace(/_/g, ' ')}</span>
                        <span className="mx-2">•</span>
                        <span>{new Date(history.timestamp).toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {riderStatus !== "available" ? (
          <div className="col-span-full text-center text-gray-500">
            Go online to view delivery requests
          </div>
        ) : deliveryRequests.length === 0 ? (
          <div className="col-span-full text-center text-gray-500">
            No delivery requests available.
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Available Delivery Requests</h2>
            <div className="space-y-4">
              {deliveryRequests.map((request) => (
                <div key={request._id} className="border rounded-lg p-4">
                  <p><span className="font-semibold">Order ID:</span> {request._id}</p>
                  <p><span className="font-semibold">Restaurant:</span> {request.restaurant?.name}</p>
                  <p><span className="font-semibold">Customer:</span> {request.customer?.name}</p>
                  <p><span className="font-semibold">Delivery Address:</span> {
                    request.deliveryAddress ? 
                    `${request.deliveryAddress.street}, ${request.deliveryAddress.city}, ${request.deliveryAddress.state} ${request.deliveryAddress.zipCode}`
                    : 'No address provided'
                  }</p>
                  <div className="mt-4 space-x-4">
                    <Button onClick={() => handleAcceptRequest(request._id)} className="bg-green-500">
                      Accept
                    </Button>
                    <Button onClick={() => handleDeclineRequest(request._id)} className="bg-red-500">
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default RiderDashboard; 
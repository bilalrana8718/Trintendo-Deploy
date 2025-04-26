"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";
import {
  MapPin,
  Clock,
  Store,
  Navigation,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { riderService } from "../services/api";

const DeliveryRequests = () => {
  const [deliveryRequests, setDeliveryRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingOrder, setProcessingOrder] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchDeliveryRequests();
  }, []);

  const fetchDeliveryRequests = async () => {
    try {
      const response = await riderService.getDeliveryRequests();
      setDeliveryRequests(response.data);
    } catch (err) {
      setError("Failed to fetch delivery requests");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId) => {
    setProcessingOrder(orderId);
    try {
      await riderService.acceptDeliveryRequest(orderId);
      toast({
        title: "Success",
        description: "Order accepted successfully",
      });
      // Remove the accepted order from the list
      setDeliveryRequests((prev) =>
        prev.filter((request) => request._id !== orderId)
      );
      // Navigate to the rider dashboard or order details
      navigate("/rider/dashboard");
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to accept order",
        variant: "destructive",
      });
    } finally {
      setProcessingOrder(null);
    }
  };

  const handleDeclineOrder = async (orderId) => {
    setProcessingOrder(orderId);
    try {
      await riderService.declineDeliveryRequest(orderId);
      toast({
        title: "Order Declined",
        description: "Order has been declined",
      });
      // Remove the declined order from the list
      setDeliveryRequests((prev) =>
        prev.filter((request) => request._id !== orderId)
      );
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to decline order",
        variant: "destructive",
      });
    } finally {
      setProcessingOrder(null);
    }
  };

  const calculateEstimatedTime = (distance) => {
    // Simple estimation: 2 minutes per kilometer + 10 minutes base time
    const estimatedMinutes = Math.round(distance * 2 + 10);
    return `${estimatedMinutes} mins`;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto p-4">
          <div className="flex justify-center items-center h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Delivery Requests</h1>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {deliveryRequests.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-lg">No delivery requests available at the moment.</p>
            <p className="text-sm mt-2">Check back later for new orders!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {deliveryRequests.map((request) => (
              <Card key={request._id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-4">
                        <Store className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold">
                          {request.restaurant.name}
                        </h3>
                        <Badge variant="outline" className="ml-2">
                          {request.items.length} items
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Pickup Location</p>
                            <p className="text-sm text-muted-foreground">
                              {request.restaurant.address}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <Navigation className="h-4 w-4 mt-1 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Delivery Address</p>
                            <p className="text-sm text-muted-foreground">
                              {request.deliveryAddress}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm">
                            Estimated Time:{" "}
                            <span className="font-medium">
                              {calculateEstimatedTime(request.distance)}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-row md:flex-col gap-2 justify-end">
                      <Button
                        className="flex-1 md:flex-none"
                        onClick={() => handleAcceptOrder(request._id)}
                        disabled={!!processingOrder}
                      >
                        {processingOrder === request._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Accept
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 md:flex-none"
                        onClick={() => handleDeclineOrder(request._id)}
                        disabled={!!processingOrder}
                      >
                        {processingOrder === request._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 mr-2" />
                            Decline
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default DeliveryRequests; 
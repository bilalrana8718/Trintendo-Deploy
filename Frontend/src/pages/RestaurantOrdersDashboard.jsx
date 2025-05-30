"use client";

import { useState, useEffect } from "react";
import { restaurantService } from "../services/api"; // Make sure this has getRestaurantOrders & updateOrderStatus functions
import Navbar from "../components/Navbar";
import Spinner from "../components/Spinner";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Alert } from "../components/ui/alert";

const RestaurantOrdersDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState("");

  // Fetch restaurant orders on mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersData = await restaurantService.getRestaurantOrders();
        setOrders(ordersData.data);
      } catch (err) {
        console.error("Failed to fetch orders", err);
        setError("Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      console.log(`Attempting to update order ${orderId} to status: ${newStatus}`);
      const updatedOrder = await restaurantService.updateOrderStatus(orderId, {
        status: newStatus,
      });
      console.log('Update successful:', updatedOrder);

      // Update order in the list locally
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? updatedOrder.data : order
        )
      );
      setNotification(`Order updated to ${newStatus}.`);
    } catch (err) {
      console.error("Failed to update order status", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to update order status.";
      setError(errorMessage);

    }
  };

  if (loading) return <Spinner />;

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Restaurant Orders Dashboard</h1>
        {notification && (
          <Alert variant="success" className="mb-4">
            {notification}
          </Alert>
        )}
        {error && (
          <Alert variant="destructive" className="mb-4">
            {error}
          </Alert>
        )}
        {orders.length === 0 ? (
          <div className="text-center text-gray-500">No orders available.</div>
        ) : (
          orders.map((order) => (
            <Card key={order._id} className="mb-4 shadow-md">
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold">
                      Order #{order._id.slice(-6).toUpperCase()}
                    </h2>
                    <p className="text-sm text-gray-600">
                      Customer: {order.customer?.name || "Unknown"}
                    </p>
                    <p className="text-sm text-gray-600">
                      Total: ${order.totalAmount.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Status: <span className="font-bold">{order.status}</span>
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {order.status === "pending" && (
                      <>
                        <Button
                          variant="outline"
                          onClick={() =>
                            handleStatusChange(order._id, "confirmed")
                          }
                        >
                          Accept
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() =>
                            handleStatusChange(order._id, "cancelled")
                          }
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    {order.status === "confirmed" && (
                      <Button
                        variant="secondary"
                        onClick={() =>
                          handleStatusChange(order._id, "preparing")
                        }
                      >
                        Start Preparing
                      </Button>
                    )}
                    {order.status === "preparing" && (
                      <Button
                        variant="secondary"
                        onClick={() =>
                          handleStatusChange(order._id, "ready_for_pickup")
                        }
                      >
                        Ready for Pickup
                      </Button>
                    )}
                    {order.status === "ready_for_pickup" && (
                      <div className="text-sm text-gray-600">
                        Waiting for rider pickup
                      </div>

                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="font-semibold">Items:</h3>
                  <ul className="list-disc ml-6">
                    {order.items.map((item) => (
                      <li key={item.menuItem}>
                        {item.name} x {item.quantity} - ${item.price.toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </>
  );
};

export default RestaurantOrdersDashboard;

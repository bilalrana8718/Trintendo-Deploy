"use client";

import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { OrderContext } from "../context/OrderContext";
import Navbar from "../components/Navbar";
import Spinner from "../components/Spinner";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import { ShoppingBag, Calendar, ChevronRight } from "lucide-react";

const CustomerOrders = () => {
  const { orders, loading, error, fetchOrders } = useContext(OrderContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      await fetchOrders();
      setIsLoading(false);
    };

    loadOrders();
  }, [fetchOrders]);

  // Helper function to get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "preparing":
        return "bg-indigo-100 text-indigo-800";
      case "out_for_delivery":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (isLoading) return <Spinner />;

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Orders</h1>
          <Link to="/">
            <Button variant="outline">Continue Shopping</Button>
          </Link>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {orders.length === 0 ? (
          <Card className="text-center p-8">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="bg-muted rounded-full p-6 mb-4">
                <ShoppingBag className="h-12 w-12 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">No orders yet</h2>
              <p className="text-muted-foreground mb-6">
                You haven't placed any orders yet.
              </p>
              <Link to="/">
                <Button>Browse Restaurants</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card
                key={order._id}
                className="overflow-hidden transition-all duration-300 hover:shadow-md"
              >
                <CardContent className="p-0">
                  <div className="p-6 border-b">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">
                            Order #{order._id.substring(order._id.length - 8)}
                          </h3>
                          <div
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {order.status.replace("_", " ").toUpperCase()}
                          </div>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(order.createdAt)}
                        </div>
                      </div>
                      <div className="mt-4 md:mt-0 flex flex-col items-end">
                        <p className="font-semibold text-lg">
                          ${order.totalAmount.toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.items.length} items
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">
                        DELIVERY TO
                      </h4>
                      <p className="text-sm">
                        {order.deliveryAddress.street},{" "}
                        {order.deliveryAddress.city},{" "}
                        {order.deliveryAddress.state}{" "}
                        {order.deliveryAddress.zipCode}
                      </p>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">
                        ITEMS
                      </h4>
                      <div className="space-y-2">
                        {order.items.slice(0, 2).map((item) => (
                          <div key={item._id} className="flex justify-between">
                            <p className="text-sm">
                              {item.quantity} x {item.name}
                            </p>
                            <p className="text-sm font-medium">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <p className="text-sm text-muted-foreground">
                            +{order.items.length - 2} more{" "}
                            {order.items.length - 2 === 1 ? "item" : "items"}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between">
                      {order.status === "pending" ||
                      order.status === "confirmed" ? (
                        <Button
                          variant="outline"
                          className="text-destructive border-destructive hover:bg-destructive/10"
                        >
                          Cancel Order
                        </Button>
                      ) : (
                        <div></div>
                      )}
                      <Link to={`/orders/${order._id}`}>
                        <Button variant="outline" className="flex items-center">
                          View Details
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </Link>
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

export default CustomerOrders;

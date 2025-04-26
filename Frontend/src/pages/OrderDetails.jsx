"use client"

import { useEffect, useState, useContext } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { OrderContext } from "../context/OrderContext"
import Navbar from "../components/Navbar"
import Spinner from "../components/Spinner"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Alert, AlertDescription } from "../components/ui/alert"
import { ShoppingBag, Clock, ArrowLeft, MapPin, Phone, CreditCard, Banknote, CheckCircle2, XCircle, Star } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog"
import { Textarea } from "../components/ui/textarea"
import { Label } from "../components/ui/label"
import { restaurantService } from "../services/api"
import { orderService } from "../services/customer-api"

const OrderDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getOrderById, cancelOrder } = useContext(OrderContext)
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [cancelling, setCancelling] = useState(false)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewError, setReviewError] = useState("")

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const orderData = await getOrderById(id)
        if (orderData) {
          setOrder(orderData)
        } else {
          setError("Order not found")
        }
      } catch (err) {
        setError("Failed to load order details")
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [])

  const handleCancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) {
      return
    }

    setCancelling(true)
    try {
      const result = await cancelOrder(id)
      if (result.success) {
        // Refresh order data
        const updatedOrder = await getOrderById(id)
        setOrder(updatedOrder)
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError("Failed to cancel order")
    } finally {
      setCancelling(false)
    }
  }

  const handleSubmitReview = async () => {
    if (rating < 1 || rating > 5) {
      setReviewError("Rating must be between 1 and 5")
      return
    }

    setSubmittingReview(true)
    setReviewError("")

    try {
      const result = await orderService.submitOrderReview(order._id, rating, comment)
      
      if (result.success) {
        // Refresh order data
        const updatedOrder = await getOrderById(id)
        setOrder(updatedOrder)
        setReviewDialogOpen(false)
      } else {
        throw new Error(result.message || "Failed to submit review")
      }
    } catch (err) {
      setReviewError(err.message || "Failed to submit review")
    } finally {
      setSubmittingReview(false)
    }
  }

  // Helper function to get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "preparing":
        return "bg-indigo-100 text-indigo-800"
      case "out_for_delivery":
        return "bg-purple-100 text-purple-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Format date
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
    return new Date(dateString).toLocaleString(undefined, options)
  }

  if (loading) return <Spinner />

  if (error) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button onClick={() => navigate("/orders")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button variant="outline" onClick={() => navigate("/orders")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
          
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card className="mb-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Order Details</CardTitle>
                <div className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(order.status)}`}>
                  {order.status.replace("_", " ").toUpperCase()}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between border-b pb-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">ORDER ID</h3>
                      <p>{order._id}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">DATE PLACED</h3>
                      <p>{formatDate(order.createdAt)}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">RESTAURANT</h3>
                    <div className="flex items-start">
                      <div className="bg-muted/30 p-3 rounded mr-3">
                        <ShoppingBag className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{order.restaurant?.name || "Restaurant"}</p>
                        <p className="text-sm text-muted-foreground">{order.restaurant?.address || "Address"}</p>
                        {order.restaurant?.phone && (
                          <div className="flex items-center mt-1 text-sm">
                            <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                            {order.restaurant.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">DELIVERY ADDRESS</h3>
                    <div className="flex items-start">
                      <div className="bg-muted/30 p-3 rounded mr-3">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p>{order.deliveryAddress.street}</p>
                        <p>
                          {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">PAYMENT METHOD</h3>
                    <div className="flex items-center">
                      <div className="bg-muted/30 p-3 rounded mr-3">
                        {order.paymentMethod === "card" ? (
                          <CreditCard className="h-5 w-5 text-primary" />
                        ) : (
                          <Banknote className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <p className="capitalize">{order.paymentMethod}</p>
                    </div>
                  </div>

                  {(order.status === "pending" || order.status === "confirmed") && (
                    <div className="pt-4">
                      <Button
                        variant="destructive"
                        onClick={handleCancelOrder}
                        disabled={cancelling}
                        className="w-full"
                      >
                        {cancelling ? (
                          <>
                            <Spinner className="mr-2 h-4 w-4" />
                            Cancelling...
                          </>
                        ) : (
                          <>
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancel Order
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {order.status === "delivered" && !order.review.rating  && (
                    <div className="pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setReviewDialogOpen(true)}
                        className="w-full"
                      >
                        <Star className="mr-2 h-4 w-4" />
                        Add Review
                      </Button>
                    </div>
                  )}

                  {order.status === "delivered" && order.review && (
                    <div className="pt-4">
                      <div className="p-4 bg-muted/30 rounded-lg">
                        <div className="flex items-center mb-2">
                          <h3 className="text-sm font-medium">Your Review</h3>
                          <div className="ml-auto flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < order.review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {order.review.comment && (
                          <p className="text-sm text-muted-foreground">{order.review.comment}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDate(order.review.createdAt)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item._id} className="flex items-center p-4 bg-muted/30 rounded-lg">
                      <div className="w-16 h-16 rounded overflow-hidden mr-4">
                        {item.image ? (
                          <img
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} x ${item.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="font-semibold">${(item.quantity * item.price).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${order.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span>$2.99</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span>${(order.totalAmount * 0.08).toFixed(2)}</span>
                  </div>

                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>${(order.totalAmount + 2.99 + order.totalAmount * 0.08).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <div className="flex items-center p-3 bg-muted/30 rounded-lg">
                      <Clock className="h-5 w-5 text-muted-foreground mr-2" />
                      <div>
                        <p className="text-sm font-medium">Estimated Delivery Time</p>
                        <p className="text-sm text-muted-foreground">30-45 minutes</p>
                      </div>
                    </div>
                  </div>

                  {order.status === "delivered" && (
                    <div className="pt-4">
                      <div className="flex items-center p-3 bg-green-50 rounded-lg">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-green-800">Order Delivered</p>
                          <p className="text-sm text-green-600">{formatDate(order.updatedAt)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Submit Review</DialogTitle>
            <DialogDescription>
              Share your experience about this order and restaurant
            </DialogDescription>
          </DialogHeader>
          
          {reviewError && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{reviewError}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-4 py-4">
            <div className="flex justify-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-8 w-8 cursor-pointer ${
                    star <= rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                  }`}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
            
            <div>
              <Label htmlFor="comment">Your Comments (Optional)</Label>
              <Textarea
                id="comment"
                placeholder="Tell us about your experience..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitReview} disabled={submittingReview}>
              {submittingReview ? "Submitting..." : "Submit Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default OrderDetails

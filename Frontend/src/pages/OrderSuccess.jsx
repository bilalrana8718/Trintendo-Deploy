"use client"

import { useEffect, useState, useContext } from "react"
import { Link, useParams, useLocation } from "react-router-dom"
import { OrderContext } from "../context/OrderContext"
import Navbar from "../components/Navbar"
import Spinner from "../components/Spinner"
import { Card, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Alert, AlertDescription } from "../components/ui/alert"
import { CheckCircle, Clock, MapPin, ArrowRight, ShoppingBag, CreditCard } from "lucide-react"

const OrderSuccess = () => {
  const { id } = useParams()
  const location = useLocation()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const { getOrderById } = useContext(OrderContext)
  const [order, setOrder] = useState(null)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    if (searchParams.get('payment_success') === 'true') {
      setPaymentSuccess(true)
    }

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
  }, [id, getOrderById, location.search])

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
            <Link to="/">
              <Button>Return to Home</Button>
            </Link>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="border-none shadow-lg">
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Order Placed Successfully!</h1>
              <p className="text-muted-foreground">
                Thank you for your order. Your order has been received and is being processed.
              </p>
              {paymentSuccess && (
                <Alert className="mt-4 bg-green-50 border-green-200 text-green-700">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <AlertDescription>
                    Payment processed successfully with Stripe!
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="bg-muted/30 p-6 rounded-lg mb-8">
              <div className="flex flex-col md:flex-row justify-between mb-4">
                <div>
                  <h2 className="text-sm font-medium text-muted-foreground">ORDER NUMBER</h2>
                  <p className="font-medium">{order._id}</p>
                </div>
                <div className="mt-4 md:mt-0">
                  <h2 className="text-sm font-medium text-muted-foreground">ORDER DATE</h2>
                  <p className="font-medium">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div className="mt-4 md:mt-0">
                  <h2 className="text-sm font-medium text-muted-foreground">TOTAL AMOUNT</h2>
                  <p className="font-medium">${order.totalAmount.toFixed(2)}</p>
                </div>
                <div className="mt-4 md:mt-0">
                  <h2 className="text-sm font-medium text-muted-foreground">PAYMENT METHOD</h2>
                  <p className="font-medium capitalize flex items-center">
                    {order.paymentMethod === 'card' && <CreditCard className="h-4 w-4 mr-1" />}
                    {order.paymentMethod}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Order Status</h2>
              <div className="flex items-center p-4 bg-primary/10 rounded-lg">
                <Clock className="h-5 w-5 text-primary mr-2" />
                <span className="font-medium capitalize">{order.status}</span>
              </div>
            </div>

            {order.paymentMethod === 'card' && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Payment Status</h2>
                <div className="flex items-center p-4 bg-primary/10 rounded-lg">
                  <CreditCard className="h-5 w-5 text-primary mr-2" />
                  <span className="font-medium capitalize">{order.paymentStatus}</span>
                </div>
              </div>
            )}

            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Delivery Address</h2>
              <div className="flex items-start p-4 bg-muted/30 rounded-lg">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="font-medium">{order.deliveryAddress.street}</p>
                  <p className="text-muted-foreground">
                    {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item._id} className="flex items-center p-4 bg-muted/30 rounded-lg">
                    <div className="w-12 h-12 rounded overflow-hidden mr-4">
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
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/orders">
                <Button className="w-full">
                  View All Orders
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/">
                <Button variant="outline" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

export default OrderSuccess


"use client"

import { useContext, useEffect, useState, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { CartContext } from "../context/CartContext"
import Navbar from "../components/Navbar"
import Spinner from "../components/Spinner"
import { Card, CardContent, CardFooter } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Alert, AlertDescription } from "../components/ui/alert"
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight } from "lucide-react"
import { useToast } from "../hooks/use-toast"

const Cart = () => {
  const navigate = useNavigate()
  const [isLocalLoading, setIsLocalLoading] = useState(true)
  const initialFetchAttempted = useRef(false)
  const { toast } = useToast()

  // Get cart context safely
  const cartContextValue = useContext(CartContext)

  // Handle the case where CartContext might not be available
  if (!cartContextValue && !initialFetchAttempted.current) {
    console.error("CartContext is not available. Make sure CartProvider is wrapping this component.")
    initialFetchAttempted.current = true
    // We'll continue with default values below
  }

  const {
    cart = { items: [] },
    loading = false,
    error = "",
    cartTotal = 0,
    fetchCart = async () => {},
    updateCartItem = async () => {},
    removeFromCart = async () => {},
    clearCart = async () => {},
  } = cartContextValue || {}

  // Only attempt to fetch cart ONCE when component mounts
  useEffect(() => {
    const loadCart = async () => {
      if (!initialFetchAttempted.current) {
        initialFetchAttempted.current = true
        try {
          console.log("Cart component attempting initial fetch")
          await fetchCart()
        } catch (err) {
          console.error("Error loading cart:", err)
          toast({
            title: "Error",
            description: "Failed to load your cart. Please try again.",
            variant: "destructive",
          })
        } finally {
          setIsLocalLoading(false)
        }
      } else {
        // If we've already attempted to fetch, just update loading state
        setIsLocalLoading(false)
      }
    }

    loadCart()

    // Empty dependency array - run only once on mount
  }, [])

  const handleQuantityChange = async (itemId, currentQuantity, change) => {
    try {
      const newQuantity = currentQuantity + change
      if (newQuantity < 1) return
      await updateCartItem(itemId, newQuantity)
      toast({
        title: "Cart updated",
        description: "Item quantity has been updated.",
      })
    } catch (err) {
      console.error("Error updating quantity:", err)
      toast({
        title: "Error",
        description: "Failed to update item quantity. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleRemoveItem = async (itemId) => {
    try {
      await removeFromCart(itemId)
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart.",
      })
    } catch (err) {
      console.error("Error removing item:", err)
      toast({
        title: "Error",
        description: "Failed to remove item. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleClearCart = async () => {
    try {
      if (window.confirm("Are you sure you want to clear your cart?")) {
        await clearCart()
        toast({
          title: "Cart cleared",
          description: "All items have been removed from your cart.",
        })
      }
    } catch (err) {
      console.error("Error clearing cart:", err)
      toast({
        title: "Error",
        description: "Failed to clear cart. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCheckout = () => {
    // Check if cart is empty before proceeding
    if (!cart?.items?.length) {
      toast({
        title: "Empty cart",
        description: "Please add items to your cart before checkout.",
        variant: "destructive",
      })
      return
    }

    navigate("/checkout")
  }

  // Ensure we have cart data before rendering
  if (isLocalLoading || loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto flex justify-center items-center py-20">
          <Spinner />
        </div>
      </>
    )
  }

  // Get cart items safely
  const cartItems = cart?.items || []
  const cartTotalValue = cartTotal || 0
  const restaurantName = cartItems.length > 0 ? cartItems[0]?.restaurantName || "Restaurant" : "Restaurant"

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {cartItems.length === 0 ? (
          <Card className="text-center p-8">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="bg-muted rounded-full p-6 mb-4">
                <ShoppingCart className="h-12 w-12 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">Looks like you haven't added any items to your cart yet.</p>
              <Link to="/">
                <Button>Browse Restaurants</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">
                      {cartItems.length} {cartItems.length === 1 ? "Item" : "Items"} from {restaurantName}
                    </h2>
                    <Button variant="outline" size="sm" onClick={handleClearCart}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear Cart
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item._id} className="flex border-b pb-4">
                        <div className="w-24 h-24 rounded overflow-hidden mr-4">
                          {item.image ? (
                            <img
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <p className="text-xs text-muted-foreground">No Image</p>
                            </div>
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h3 className="font-medium">{item.name}</h3>
                            <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                          </div>

                          <p className="text-sm text-muted-foreground mb-2">${item.price.toFixed(2)} each</p>

                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                                onClick={() => handleQuantityChange(item._id, item.quantity, -1)}
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="mx-3">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                                onClick={() => handleQuantityChange(item._id, item.quantity, 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleRemoveItem(item._id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${cartTotalValue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delivery Fee</span>
                      <span>$2.99</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax</span>
                      <span>${(cartTotalValue * 0.08).toFixed(2)}</span>
                    </div>

                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span>${(cartTotalValue + 2.99 + cartTotalValue * 0.08).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="px-6 pb-6 pt-0">
                  <Button className="w-full" size="lg" onClick={handleCheckout}>
                    Proceed to Checkout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default Cart


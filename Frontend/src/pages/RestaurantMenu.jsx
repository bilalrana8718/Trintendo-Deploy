"use client"

import { useState, useEffect, useContext } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { restaurantService } from "../services/api"
import { CustomerContext } from "../context/CustomerContext"
import { CartContext } from "../context/CartContext"
import Navbar from "../components/Navbar"
import Spinner from "../components/Spinner"
import { Card, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Alert, AlertDescription } from "../components/ui/alert"
import { Badge } from "../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { ShoppingCart, Clock, MapPin, Phone, Plus } from "lucide-react"

const RestaurantMenu = () => {
  const [restaurant, setRestaurant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")
  const [categories, setCategories] = useState([])
  const [menuItems, setMenuItems] = useState([])
  const [addingToCart, setAddingToCart] = useState({})

  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useContext(CustomerContext)
  const { addToCart, cart } = useContext(CartContext)

useEffect(() => {
  const fetchRestaurant = async () => {
    try {
      const response = await restaurantService.getRestaurantById(id)
      setRestaurant(response.data)

      const uniqueCategories = [...new Set(response.data.menu.map((item) => item.category))]
      setCategories(uniqueCategories)
      
      // Set menu items
      setMenuItems(response.data.menu)
    } catch (err) {
      setError("Failed to fetch restaurant details")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  fetchRestaurant()
}, [id])

  const handleAddToCart = async (menuItemId) => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      navigate("/customer/login", { state: { from: `/restaurants/${id}/view` } })
      return
    }

    setAddingToCart((prev) => ({ ...prev, [menuItemId]: true }))

    try {
      const result = await addToCart(restaurant._id, menuItemId, 1)

      if (!result.success) {
        setError(result.message)
      }
    } catch (err) {
      setError("Failed to add item to cart")
    } finally {
      setAddingToCart((prev) => ({ ...prev, [menuItemId]: false }))
    }
  }

  const filterMenuItems = (category) => {
    if (category === "all") {
      return menuItems
    }
    return menuItems.filter((item) => item.category === category)
  }

  // Check if item is in cart
  const isInCart = (menuItemId) => {
    return cart.items.some((item) => item.menuItem === menuItemId)
  }

  if (loading) return <Spinner />

  if (!restaurant) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertDescription>Restaurant not found</AlertDescription>
          </Alert>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Restaurant Header */}
        <div className="mb-8">
          <div className="relative h-64 w-full rounded-xl overflow-hidden mb-6">
            <img
              src={restaurant.image || "/placeholder.svg?height=256&width=1024"}
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-6 text-white">
              <h1 className="text-3xl font-bold mb-2">{restaurant.name}</h1>
              <p className="text-white/90 mb-2">{restaurant.cuisine}</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {restaurant.address}
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-1" />
                  {restaurant.phone}
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {restaurant.isOpen ? "Open Now" : "Closed"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Menu Categories */}
        <div className="mb-8">
          <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Items</TabsTrigger>
              {categories.map((category) => (
                <TabsTrigger key={category} value={category}>
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={activeCategory} className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterMenuItems(activeCategory).map((item) => (
                  <Card key={item._id} className="overflow-hidden transition-all duration-300 hover:shadow-md">
                    <div className="relative">
                      <div className="relative h-48 w-full">
                        {item.image ? (
                          <img
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-muted flex items-center justify-center">
                            <p className="text-muted-foreground">No Image</p>
                          </div>
                        )}
                        {!item.isAvailable && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Badge variant="destructive" className="text-lg py-1 px-3">
                              Unavailable
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-semibold">{item.name}</h3>
                        <div className="text-lg font-bold">${item.price.toFixed(2)}</div>
                      </div>

                      <p className="text-muted-foreground mb-4 text-sm">
                        {item.description || "No description available"}
                      </p>

                      <Badge variant="outline" className="mb-4">
                        {item.category}
                      </Badge>

                      <Button
                        className="w-full"
                        disabled={!item.isAvailable || addingToCart[item._id] || isInCart(item._id)}
                        onClick={() => handleAddToCart(item._id)}
                      >
                        {addingToCart[item._id] ? (
                          <>
                            <Spinner className="mr-2 h-4 w-4" />
                            Adding...
                          </>
                        ) : isInCart(item._id) ? (
                          <>
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Added to Cart
                          </>
                        ) : (
                          <>
                            <Plus className="mr-2 h-4 w-4" />
                            Add to Cart
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  )
}

export default RestaurantMenu


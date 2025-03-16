"use client"

import { useState, useEffect, useContext } from "react"
import { Link } from "react-router-dom"
import { restaurantService } from "../services/api"
import { cartService } from "../services/customer-api"
import { AuthContext } from "../context/AuthContext"
import Navbar from "../components/Navbar"
import Spinner from "../components/Spinner"
import { Card, CardContent, CardFooter } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Alert, AlertDescription } from "../components/ui/alert"
import { ChevronRight, Clock, MapPin, ShieldCheck, Star, ThumbsUp, ShoppingBag } from "lucide-react"
import { useToast } from "../hooks/use-toast"

const Home = () => {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [featuredRestaurants, setFeaturedRestaurants] = useState([])
  const { user } = useContext(AuthContext)
  const { toast } = useToast()

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await restaurantService.getAllRestaurants()
        setRestaurants(response.data)

        // Get featured restaurants (top 3 by rating or random if not enough)
        if (response.data.length > 0) {
          const sortedRestaurants = [...response.data].sort((a, b) => (b.rating || 4.0) - (a.rating || 4.0)).slice(0, 3)
          setFeaturedRestaurants(sortedRestaurants)
        }
      } catch (err) {
        setError("Failed to fetch restaurants")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchRestaurants()
  }, [])

  const handleQuickOrder = async (restaurantId) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login as a customer to place an order",
        variant: "destructive",
      })
      return
    }

    try {
      // Example of adding a popular item to cart
      await cartService.addToCart({
        restaurantId,
        itemId: "popular-item-id", // This would be a real item ID in production
        quantity: 1,
      })

      toast({
        title: "Added to cart",
        description: "Popular item added to your cart",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      })
      console.error(err)
    }
  }

  if (loading) return <Spinner />

  return (
    <>
      <Navbar />
      <div className="flex flex-col min-h-screen">
        {/* Hero Section */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70 z-10" />
          <div
            className="relative h-[400px] bg-cover bg-center"
            style={{ backgroundImage: "url('/src/assets/react.svg')" }}
          >
            <div className="container mx-auto px-4 h-full flex items-center relative z-20">
              <div className="max-w-2xl text-white">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">Delicious Food, Delivered Fast</h1>
                <p className="text-lg md:text-xl mb-8">
                  Order from your favorite local restaurants with free delivery on your first order
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to={user ? "/restaurants" : "/customer/login"}>
                    <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                      Order Now
                    </Button>
                  </Link>
                  <Button size="lg" variant="outline" className="text-gray-600 border-white hover:bg-white/20">
                    View Restaurants
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* USP Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border-none shadow-sm bg-background">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
                  <p className="text-muted-foreground">
                    Food delivered in 30 minutes or less, guaranteed fresh and hot
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-background">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Contactless Delivery</h3>
                  <p className="text-muted-foreground">
                    Safe, hygienic, and contactless delivery right to your doorstep
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-background">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Local Restaurants</h3>
                  <p className="text-muted-foreground">
                    Support local businesses with our wide selection of nearby restaurants
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Featured Restaurants */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Featured Restaurants</h2>
              <Button variant="ghost" className="gap-1">
                View All <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {featuredRestaurants.length === 0 ? (
              <Card className="text-center p-8">
                <h3 className="text-xl font-semibold">No featured restaurants available yet</h3>
                <p className="my-2 text-muted-foreground">Check back soon for new restaurants</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredRestaurants.map((restaurant) => (
                  <Card
                    key={restaurant._id}
                    className="overflow-hidden transition-all duration-300 hover:shadow-md border-primary/20"
                  >
                    <div className="relative">
                      <div className="relative h-48 w-full">
                        {restaurant.image ? (
                          <img
                            src={restaurant.image || "/placeholder.svg"}
                            alt={restaurant.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-muted flex items-center justify-center">
                            <p className="text-muted-foreground">No Image</p>
                          </div>
                        )}
                        <div className="absolute top-3 right-3">
                          <div className="bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium border border-primary/20">
                            <ThumbsUp className="h-3 w-3 mr-1 inline fill-primary text-primary" />
                            Featured
                          </div>
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-semibold">{restaurant.name}</h3>
                        <div className="flex items-center bg-primary/10 px-2 py-1 rounded">
                          <span className="text-sm font-medium">{restaurant.rating || "4.5"}</span>
                          <Star className="h-3 w-3 ml-1 fill-yellow-400 text-yellow-400" />
                        </div>
                      </div>

                      <p className="text-muted-foreground">{restaurant.cuisine}</p>
                      <p className="text-sm text-muted-foreground mt-1">{restaurant.address}</p>
                    </CardContent>

                    <CardFooter className="p-4 pt-0 flex gap-2">
                      <Button asChild className="flex-1">
                        <Link to={`/restaurants/${restaurant._id}/view`}>View Menu</Link>
                      </Button>
                      {user && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleQuickOrder(restaurant._id)}
                          title="Quick Order"
                        >
                          <ShoppingBag className="h-4 w-4" />
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* All Restaurants */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8">All Restaurants</h2>

            {restaurants.length === 0 ? (
              <Card className="text-center p-8">
                <h3 className="text-xl font-semibold">No restaurants available yet</h3>
                <p className="my-2 text-muted-foreground">Check back soon for new restaurants</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {restaurants.map((restaurant) => (
                  <Card key={restaurant._id} className="overflow-hidden transition-all duration-300 hover:shadow-md">
                    <div className="relative">
                      <div className="relative h-48 w-full">
                        {restaurant.image ? (
                          <img
                            src={restaurant.image || "/placeholder.svg"}
                            alt={restaurant.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-muted flex items-center justify-center">
                            <p className="text-muted-foreground">No Image</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-semibold">{restaurant.name}</h3>
                        <div className="flex items-center bg-primary/10 px-2 py-1 rounded">
                          <span className="text-sm font-medium">{restaurant.rating || "4.5"}</span>
                          <Star className="h-3 w-3 ml-1 fill-yellow-400 text-yellow-400" />
                        </div>
                      </div>

                      <p className="text-muted-foreground">{restaurant.cuisine}</p>
                      <p className="text-sm text-muted-foreground mt-1">{restaurant.address}</p>
                    </CardContent>

                    <CardFooter className="p-4 pt-0 flex gap-2">
                      <Button asChild className="flex-1">
                        <Link to={`/restaurants/${restaurant._id}/view`}>View Menu</Link>
                      </Button>
                      {user && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleQuickOrder(restaurant._id)}
                          title="Quick Order"
                        >
                          <ShoppingBag className="h-4 w-4" />
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Download App CTA */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-8 md:mb-0 md:max-w-md">
                <h2 className="text-3xl font-bold mb-4">Download Our App</h2>
                <p className="text-primary-foreground/90 mb-6">
                  Get exclusive deals and faster ordering with our mobile app. Available for iOS and Android.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button variant="secondary" size="lg">
                    App Store
                  </Button>
                  <Button variant="outline" size="lg" className="text-white border-white hover:bg-white/20">
                    Google Play
                  </Button>
                </div>
              </div>
              <div className="w-full md:w-auto">
                <div className="bg-white/10 rounded-lg p-4 h-[300px] w-[200px] mx-auto"></div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export default Home


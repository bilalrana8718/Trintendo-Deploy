"use client"

import { useState, useEffect, useContext } from "react"
import { Link } from "react-router-dom"
import { restaurantService } from "../services/api"
import { AuthContext } from "../context/AuthContext"
import Navbar from "../components/Navbar"
import Spinner from "../components/Spinner"
import { Card, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Alert, AlertDescription } from "../components/ui/alert"
import { PlusCircle, Settings, Utensils } from "lucide-react"

const Dashboard = () => {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const { user } = useContext(AuthContext)

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await restaurantService.getMyRestaurants()
        setRestaurants(response.data)
      } catch (err) {
        setError("Failed to fetch restaurants")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchRestaurants()
  }, [])

  if (loading) return <Spinner />

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Restaurants</h1>
            <p className="text-muted-foreground mt-1">Manage your restaurant listings and menus</p>
          </div>
          <Link to="/restaurants/create">
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Add New Restaurant
            </Button>
          </Link>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {restaurants.length === 0 ? (
          <Card className="bg-muted/30 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-primary/10 p-3 mb-4">
                <Utensils className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No restaurants yet</h3>
              <p className="text-muted-foreground text-center max-w-md mb-6">
                Start by creating your first restaurant to showcase your menu and receive orders
              </p>
              <Link to="/restaurants/create">
                <Button className="flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Create Restaurant
                </Button>
              </Link>
            </CardContent>
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
                    <div className="absolute top-3 right-3">
                      <div
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          restaurant.isOpen ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {restaurant.isOpen ? "Open" : "Closed"}
                      </div>
                    </div>
                  </div>
                </div>

                <CardContent className="p-4">
                  <h3 className="text-xl font-semibold mb-1">{restaurant.name}</h3>
                  <p className="text-muted-foreground mb-1">{restaurant.cuisine}</p>
                  <p className="text-sm text-muted-foreground mb-4">{restaurant.address}</p>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Link to={`/restaurants/${restaurant._id}`} className="flex-1">
                      <Button variant="outline" className="w-full flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Edit Details
                      </Button>
                    </Link>
                    <Link to={`/restaurants/${restaurant._id}/menu`} className="flex-1">
                      <Button className="w-full flex items-center gap-2">
                        <Utensils className="h-4 w-4" />
                        Manage Menu
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default Dashboard


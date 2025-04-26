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
import { PlusCircle, Settings, Utensils, ShoppingBag, Clock } from 'lucide-react'

const Dashboard = () => {
  const [restaurants, setRestaurants] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [stats, setStats] = useState({
    totalRestaurants: 0,
    activeOrders: 0,
    totalSales: 0
  })

  const { user } = useContext(AuthContext)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch restaurants
        const restaurantsResponse = await restaurantService.getMyRestaurants()
        setRestaurants(restaurantsResponse.data)
        
        // Fetch orders to calculate active orders and total sales
        const ordersResponse = await restaurantService.getRestaurantOrders()
        const allOrders = ordersResponse.data
        
        // Calculate active orders (orders that are not delivered or cancelled)
        const activeOrdersCount = allOrders.filter(
          order => order.status !== "delivered" && order.status !== "cancelled"
        ).length
        
        // Calculate total sales (sum of all order amounts)
        const totalSalesAmount = allOrders.reduce(
          (total, order) => total + order.totalAmount, 0
        )
        
        // Set stats with actual values
        setStats({
          totalRestaurants: restaurantsResponse.data.length,
          activeOrders: activeOrdersCount,
          totalSales: totalSalesAmount
        })
        
      } catch (err) {
        setError("Failed to fetch dashboard data")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
  
    fetchData()
  }, [])

  if (loading) return <Spinner />

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back, {user?.name || "Owner"}</p>
          </div>
          <Link to="/restaurants/create">
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Add New Restaurant
            </Button>
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-primary/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Restaurants</p>
                  <h3 className="text-3xl font-bold mt-1">{stats.totalRestaurants}</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Utensils className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Orders</p>
                  <h3 className="text-3xl font-bold mt-1">{stats.activeOrders}</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <ShoppingBag className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
                  <h3 className="text-3xl font-bold mt-1">${stats.totalSales.toFixed(2)}</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <h2 className="text-2xl font-bold mb-6">My Restaurants</h2>

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

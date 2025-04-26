"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { restaurantService } from "../services/api"
import Navbar from "../components/Navbar"
import Spinner from "../components/Spinner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { Button } from "../components/ui/button"
import { Alert, AlertDescription } from "../components/ui/alert"
import { Checkbox } from "../components/ui/checkbox"
import { ArrowLeft, Loader2, Store, MapPin, Phone, Utensils, Image } from 'lucide-react'

const RestaurantDetails = () => {
  const [restaurant, setRestaurant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    cuisine: "",
    image: "",
    isOpen: true,
  })
  const [updating, setUpdating] = useState(false)
  const [updateSuccess, setUpdateSuccess] = useState(false)

  const { id } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const response = await restaurantService.getRestaurantById(id)
        setRestaurant(response.data)
        setFormData({
          name: response.data.name,
          description: response.data.description || "",
          address: response.data.address,
          phone: response.data.phone,
          cuisine: response.data.cuisine,
          image: response.data.image || "",
          isOpen: response.data.isOpen,
        })
      } catch (err) {
        setError("Failed to fetch restaurant details")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchRestaurant()
  }, [id])

  const handleChange = (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value
    setFormData({
      ...formData,
      [e.target.name]: value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setUpdateSuccess(false)
    setUpdating(true)

    try {
      const response = await restaurantService.updateRestaurant(id, formData)
      setRestaurant(response.data)
      setUpdateSuccess(true)
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setUpdateSuccess(false)
      }, 3000)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update restaurant")
      console.error(err)
    } finally {
      setUpdating(false)
    }
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
      <div className="container max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="outline" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">{restaurant.name}</h1>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {updateSuccess && (
          <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
            <AlertDescription>Restaurant updated successfully!</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Edit Restaurant</CardTitle>
            <CardDescription>Update your restaurant details and settings</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                  <Store className="h-4 w-4 text-muted-foreground" />
                  Restaurant Name
                </label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="address" className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Address
                </label>
                <Input id="address" name="address" value={formData.address} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  Phone Number
                </label>
                <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <label htmlFor="cuisine" className="text-sm font-medium flex items-center gap-2">
                  <Utensils className="h-4 w-4 text-muted-foreground" />
                  Cuisine Type
                </label>
                <Input id="cuisine" name="cuisine" value={formData.cuisine} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <label htmlFor="image" className="text-sm font-medium flex items-center gap-2">
                  <Image className="h-4 w-4 text-muted-foreground" />
                  Image URL
                </label>
                <Input
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isOpen"
                  name="isOpen"
                  checked={formData.isOpen}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      isOpen: checked,
                    })
                  }
                />
                <label
                  htmlFor="isOpen"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Restaurant is Open
                </label>
              </div>

              <Button type="submit" disabled={updating}>
                {updating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Restaurant"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

export default RestaurantDetails

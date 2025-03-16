"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { restaurantService } from "../services/api"
import Navbar from "../components/Navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { Button } from "../components/ui/button"
import { Alert, AlertDescription } from "../components/ui/alert"
import { Loader2 } from "lucide-react"

const CreateRestaurant = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    cuisine: "",
    image: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await restaurantService.createRestaurant(formData)
      navigate("/dashboard")
    } catch (err) {
      setError("Failed to create restaurant")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className="container max-w-3xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Create New Restaurant</CardTitle>
            <CardDescription>Fill in the details below to create your restaurant listing</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
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
                <label htmlFor="address" className="text-sm font-medium">
                  Address
                </label>
                <Input id="address" name="address" value={formData.address} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  Phone Number
                </label>
                <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <label htmlFor="cuisine" className="text-sm font-medium">
                  Cuisine Type
                </label>
                <Input id="cuisine" name="cuisine" value={formData.cuisine} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <label htmlFor="image" className="text-sm font-medium">
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

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => navigate("/dashboard")} disabled={loading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Restaurant"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

export default CreateRestaurant


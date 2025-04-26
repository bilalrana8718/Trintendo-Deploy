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
import { Badge } from "../components/ui/badge"
import { Checkbox } from "../components/ui/checkbox"
import { ArrowLeft, Edit, Plus, Trash2, Loader2, Image, DollarSign, Tag } from "lucide-react"

const MenuManagement = () => {
  const [restaurant, setRestaurant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
    isAvailable: true,
  })
  const [actionLoading, setActionLoading] = useState({
    type: null, // 'add', 'update', 'delete'
    itemId: null,
  })

  const { id } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const response = await restaurantService.getRestaurantById(id)
        setRestaurant(response.data)
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
    const value = e.target.name === "price" ? Number.parseFloat(e.target.value) || "" : e.target.value
    setFormData({
      ...formData,
      [e.target.name]: value,
    })
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      image: "",
      isAvailable: true,
    })
    setEditingItem(null)
    setShowAddForm(false)
  }

  const handleAddItem = async (e) => {
    e.preventDefault()
    setActionLoading({ type: "add", itemId: null })

    try {
      const response = await restaurantService.addMenuItem(id, formData)
      setRestaurant(response.data)
      resetForm()
    } catch (err) {
      setError("Failed to add menu item")
      console.error(err)
    } finally {
      setActionLoading({ type: null, itemId: null })
    }
  }

  const handleUpdateItem = async (e) => {
    e.preventDefault()
    setActionLoading({ type: "update", itemId: editingItem._id })

    try {
      const response = await restaurantService.updateMenuItem(id, editingItem._id, formData)
      setRestaurant(response.data)
      resetForm()
    } catch (err) {
      setError("Failed to update menu item")
      console.error(err)
    } finally {
      setActionLoading({ type: null, itemId: null })
    }
  }

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this menu item?")) {
      return
    }

    setActionLoading({ type: "delete", itemId })
    try {
      const response = await restaurantService.deleteMenuItem(id, itemId)
      setRestaurant(response.data)
    } catch (err) {
      setError("Failed to delete menu item")
      console.error(err)
    } finally {
      setActionLoading({ type: null, itemId: null })
    }
  }

  const startEditItem = (item) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      description: item.description || "",
      price: item.price,
      category: item.category,
      image: item.image || "",
      isAvailable: item.isAvailable !== false, // Default to true if not specified
    })
    setShowAddForm(true)
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
        <div className="flex items-center gap-2 mb-6">
          <Button variant="outline" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Menu Management - {restaurant.name}</h1>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Menu Items</CardTitle>
              <CardDescription>Add, edit or remove items from your restaurant menu</CardDescription>
            </div>
            <Button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-2">
              {showAddForm ? (
                "Cancel"
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add Menu Item
                </>
              )}
            </Button>
          </CardHeader>
          <CardContent>
            {showAddForm && (
              <Card className="mb-6 border-dashed">
                <CardHeader>
                  <CardTitle className="text-lg">{editingItem ? "Edit Menu Item" : "Add New Menu Item"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={editingItem ? handleUpdateItem : handleAddItem} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">
                        Item Name
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
                        rows="2"
                        placeholder="Describe your menu item"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="price" className="text-sm font-medium flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          Price
                        </label>
                        <Input
                          type="number"
                          id="price"
                          name="price"
                          value={formData.price}
                          onChange={handleChange}
                          step="0.01"
                          min="0"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="category" className="text-sm font-medium flex items-center gap-2">
                          <Tag className="h-4 w-4 text-muted-foreground" />
                          Category
                        </label>
                        <Input
                          id="category"
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          placeholder="Appetizers, Main Course, Desserts, etc."
                          required
                        />
                      </div>
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
                        id="isAvailable"
                        name="isAvailable"
                        checked={formData.isAvailable}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            isAvailable: checked,
                          })
                        }
                      />
                      <label
                        htmlFor="isAvailable"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Item is Available
                      </label>
                    </div>

                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={resetForm}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={actionLoading.type === "add" || actionLoading.type === "update"}>
                        {actionLoading.type === "add" ||
                        (actionLoading.type === "update" && actionLoading.itemId === editingItem?._id) ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {editingItem ? "Updating..." : "Adding..."}
                          </>
                        ) : editingItem ? (
                          "Update Item"
                        ) : (
                          "Add Item"
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {restaurant.menu.length === 0 ? (
              <div className="text-center py-12 bg-muted/30 rounded-lg">
                <h3 className="text-lg font-medium mb-2">No menu items yet</h3>
                <p className="text-muted-foreground mb-4">Add your first menu item to get started</p>
                <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Menu Item
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {restaurant.menu.map((item) => (
                  <div
                    key={item._id}
                    className="flex justify-between items-center p-4 border rounded-lg hover:bg-muted/10 transition-colors"
                  >
                    <div className="flex gap-4 items-center">
                      {item.image ? (
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-muted flex items-center justify-center rounded-md text-xs">
                          No Image
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{item.name}</h4>
                          {item.isAvailable === false && (
                            <Badge variant="outline" className="bg-red-50 text-red-800 border-red-200">
                              Unavailable
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-4 items-center">
                          <span className="font-medium">${item.price.toFixed(2)}</span>
                          <Badge variant="outline">{item.category}</Badge>
                        </div>
                        {item.description && <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEditItem(item)}
                        disabled={actionLoading.type === "delete" && actionLoading.itemId === item._id}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteItem(item._id)}
                        disabled={actionLoading.type === "delete" && actionLoading.itemId === item._id}
                      >
                        {actionLoading.type === "delete" && actionLoading.itemId === item._id ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 mr-1" />
                        )}
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}

export default MenuManagement


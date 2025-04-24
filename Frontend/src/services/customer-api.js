import axios from "axios"

const API_URL = import.meta.env.VITE_API_URL || "/api"

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add token to requests if available
api.interceptors.request.use((config) => {
  const customerToken = localStorage.getItem("customerToken")
  if (customerToken) {
    config.headers.Authorization = `Bearer ${customerToken}`
  }
  return config
})

// Error handling interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors
    if (error.response) {
      console.error("API Error Response:", error.response.status, error.response.data)

      // Handle authentication errors
      if (error.response.status === 401) {
        localStorage.removeItem("customerToken")
      }
    } else if (error.request) {
      console.error("API Error Request:", error.request)
    } else {
      console.error("API Error:", error.message)
    }
    return Promise.reject(error)
  },
)

// Customer authentication services
export const customerService = {
  // Register a new customer
  register: async (userData) => {
    try {
      const response = await api.post("/customers/register", userData)
      return response.data
    } catch (error) {
      console.error("Register error:", error)
      throw error
    }
  },

  // Login customer
  login: async (credentials) => {
    try {
      const response = await api.post("/customers/login", credentials)
      return response.data
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  },

  // Get current customer profile
  getProfile: async () => {
    try {
      const response = await api.get("/customers/me")
      return response.data
    } catch (error) {
      console.error("Get profile error:", error)
      throw error
    }
  },

  // Update customer profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.patch("/customers/profile", profileData)
      return response.data
    } catch (error) {
      console.error("Update profile error:", error)
      throw error
    }
  },
}

// Cart services
export const cartService = {
  // Get customer's cart
  getCart: async () => {
    try {
      const response = await api.get("/cart")
      return response.data
    } catch (error) {
      console.error("Get cart error:", error)
      throw error
    }
  },

  // Add item to cart
  addToCart: async (itemData) => {
    try {
      // Ensure we're sending a proper JSON object
      if (typeof itemData !== "object") {
        throw new Error("Invalid item data: must be an object")
      }

      // Log the exact data being sent
      console.log("Adding item to cart (stringified):", JSON.stringify(itemData))

      const response = await api.post("/cart/add", itemData)
      return response.data
    } catch (error) {
      console.error("Add to cart error:", error)
      throw error
    }
  },

  // Update cart item quantity
  updateCartItem: async (updateData) => {
    try {
      // Ensure we're sending a proper JSON object
      if (typeof updateData !== "object") {
        throw new Error("Invalid update data: must be an object")
      }

      const response = await api.patch("/cart/update", updateData)
      return response.data
    } catch (error) {
      console.error("Update cart item error:", error)
      throw error
    }
  },

  // Remove item from cart
  removeFromCart: async (itemId) => {
    try {
      const response = await api.delete(`/cart/item/${itemId}`)
      return response.data
    } catch (error) {
      console.error("Remove from cart error:", error)
      throw error
    }
  },

  // Clear cart
  clearCart: async () => {
    try {
      const response = await api.delete("/cart/clear")
      return response.data
    } catch (error) {
      console.error("Clear cart error:", error)
      throw error
    }
  },
}

// Order services
export const orderService = {
  // Create a new order
  createOrder: async (orderData) => {
    try {
      const response = await api.post("/orders", orderData)
      return response.data
    } catch (error) {
      console.error("Create order error:", error)
      throw error
    }
  },

  // Get customer's orders
  getOrders: async () => {
    try {
      const response = await api.get("/orders/customer")
      return response.data
    } catch (error) {
      console.error("Get orders error:", error)
      throw error
    }
  },

  // Get order details
  getOrderById: async (orderId) => {
    try {
      const response = await api.get(`/orders/customer/${orderId}`)
      return response.data
    } catch (error) {
      console.error("Get order by ID error:", error)
      throw error
    }
  },

  // Cancel order
  cancelOrder: async (orderId) => {
    try {
      const response = await api.patch(`/orders/customer/${orderId}/cancel`)
      return response.data
    } catch (error) {
      console.error("Cancel order error:", error)
      throw error
    }
  },

  submitOrderReview: async (id, rating, comment) => {
    try {
      const response = await api.post(`/orders/customer/${id}/review`, { rating, comment })
      return { success: true, data: response.data }
    } catch (error) {
      console.error("Submit review error:", error)
      return { success: false, message: error.response?.data?.message || "Failed to submit review" }
    }
  },
}

// Payment services
export const paymentService = {
  // Create Stripe checkout session
  createCheckoutSession: async (orderId) => {
    try {
      const response = await api.post("/payments/create-checkout-session", { orderId })
      return response.data
    } catch (error) {
      console.error("Create checkout session error:", error)
      throw error
    }
  }
}


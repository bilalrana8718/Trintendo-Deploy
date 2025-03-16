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

// Customer authentication services
export const customerService = {
  // Register a new customer
  register: async (userData) => {
    const response = await api.post("/customers/register", userData)
    return response.data
  },

  // Login customer
  login: async (credentials) => {
    const response = await api.post("/customers/login", credentials)
    return response.data
  },

  // Get current customer profile
  getProfile: async () => {
    const response = await api.get("/customers/me")
    return response.data
  },

  // Update customer profile
  updateProfile: async (profileData) => {
    const response = await api.patch("/customers/profile", profileData)
    return response.data
  },
}

// Cart services
export const cartService = {
  // Get customer's cart
  getCart: async () => {
    const response = await api.get("/cart")
    return response.data
  },

  // Add item to cart
  addToCart: async (itemData) => {
    const response = await api.post("/cart/add", itemData)
    return response.data
  },

  // Update cart item quantity
  updateCartItem: async (updateData) => {
    const response = await api.patch("/cart/update", updateData)
    return response.data
  },

  // Remove item from cart
  removeFromCart: async (itemId) => {
    const response = await api.delete(`/cart/item/${itemId}`)
    return response.data
  },

  // Clear cart
  clearCart: async () => {
    const response = await api.delete("/cart/clear")
    return response.data
  },
}

// Order services
export const orderService = {
  // Create a new order
  createOrder: async (orderData) => {
    const response = await api.post("/orders", orderData)
    return response.data
  },

  // Get customer's orders
  getOrders: async () => {
    const response = await api.get("/orders/customer")
    return response.data
  },

  // Get order details
  getOrderById: async (orderId) => {
    const response = await api.get(`/orders/customer/${orderId}`)
    return response.data
  },

  // Cancel order
  cancelOrder: async (orderId) => {
    const response = await api.patch(`/orders/customer/${orderId}/cancel`)
    return response.data
  },
}


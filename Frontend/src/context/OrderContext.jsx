"use client"

import { createContext, useState, useContext } from "react"
import { orderService, paymentService } from "../services/customer-api"
import { CustomerContext } from "./CustomerContext"
import { CartContext } from "./CartContext"

export const OrderContext = createContext()

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([])
  const [currentOrder, setCurrentOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const { isAuthenticated } = useContext(CustomerContext)
  const { clearCart } = useContext(CartContext)

  // Fetch customer's orders
  const fetchOrders = async () => {
    if (!isAuthenticated) return

    setLoading(true)
    setError("")
    try {
      const ordersData = await orderService.getOrders()
      setOrders(ordersData)
      return ordersData
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch orders")
      console.error("Failed to fetch orders:", err)
      return []
    } finally {
      setLoading(false)
    }
  }

  // Get order details
  const getOrderById = async (orderId) => {
    setLoading(true)
    setError("")
    try {
      const order = await orderService.getOrderById(orderId)
      setCurrentOrder(order)
      return order
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch order details")
      return null
    } finally {
      setLoading(false)
    }
  }

  // Create a new order
  const createOrder = async (orderData) => {
    setLoading(true)
    setError("")
    try {
      const newOrder = await orderService.createOrder(orderData)
      setOrders([newOrder, ...orders])
      setCurrentOrder(newOrder)

      // If payment method is card, redirect to Stripe
      if (orderData.paymentMethod === 'card') {
        const { url } = await paymentService.createCheckoutSession(newOrder._id)
        // Redirect the user to Stripe checkout
        window.location.href = url
        return { success: true, order: newOrder, redirecting: true }
      }

      // Clear the cart after successful order if not redirecting to Stripe
      await clearCart()

      return { success: true, order: newOrder }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create order")
      return {
        success: false,
        message: err.response?.data?.message || "Failed to create order",
      }
    } finally {
      setLoading(false)
    }
  }

  // Cancel order
  const cancelOrder = async (orderId) => {
    setLoading(true)
    setError("")
    try {
      const updatedOrder = await orderService.cancelOrder(orderId)

      // Update orders list
      setOrders(orders.map((order) => (order._id === orderId ? updatedOrder : order)))

      // Update current order if it's the one being cancelled
      if (currentOrder && currentOrder._id === orderId) {
        setCurrentOrder(updatedOrder)
      }

      return { success: true }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel order")
      return {
        success: false,
        message: err.response?.data?.message || "Failed to cancel order",
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <OrderContext.Provider
      value={{
        orders,
        currentOrder,
        loading,
        error,
        fetchOrders,
        getOrderById,
        createOrder,
        cancelOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  )
}

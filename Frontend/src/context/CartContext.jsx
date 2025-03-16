"use client"

import { createContext, useState, useEffect, useContext } from "react"
import { cartService } from "../services/customer-api"
import { CustomerContext } from "./CustomerContext"

export const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [] })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const { isAuthenticated } = useContext(CustomerContext)

  // Fetch cart when customer logs in
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart()
    } else {
      // Clear cart when customer logs out
      setCart({ items: [] })
    }
  }, [isAuthenticated])

  // Fetch customer's cart
  const fetchCart = async () => {
    if (!isAuthenticated) return

    setLoading(true)
    setError("")
    try {
      const cartData = await cartService.getCart()
      setCart(cartData)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch cart")
      console.error("Failed to fetch cart:", err)
    } finally {
      setLoading(false)
    }
  }

  // Add item to cart
  const addToCart = async (restaurantId, menuItemId, quantity = 1) => {
    setLoading(true)
    setError("")
    try {
      const updatedCart = await cartService.addToCart({
        restaurantId,
        menuItemId,
        quantity,
      })
      setCart(updatedCart)
      return { success: true }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add item to cart")
      return {
        success: false,
        message: err.response?.data?.message || "Failed to add item to cart",
      }
    } finally {
      setLoading(false)
    }
  }

  // Update cart item quantity
  const updateCartItem = async (itemId, quantity) => {
    setLoading(true)
    setError("")
    try {
      const updatedCart = await cartService.updateCartItem({
        itemId,
        quantity,
      })
      setCart(updatedCart)
      return { success: true }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update cart")
      return {
        success: false,
        message: err.response?.data?.message || "Failed to update cart",
      }
    } finally {
      setLoading(false)
    }
  }

  // Remove item from cart
  const removeFromCart = async (itemId) => {
    setLoading(true)
    setError("")
    try {
      const updatedCart = await cartService.removeFromCart(itemId)
      setCart(updatedCart)
      return { success: true }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove item from cart")
      return {
        success: false,
        message: err.response?.data?.message || "Failed to remove item from cart",
      }
    } finally {
      setLoading(false)
    }
  }

  // Clear cart
  const clearCart = async () => {
    setLoading(true)
    setError("")
    try {
      await cartService.clearCart()
      setCart({ items: [] })
      return { success: true }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to clear cart")
      return {
        success: false,
        message: err.response?.data?.message || "Failed to clear cart",
      }
    } finally {
      setLoading(false)
    }
  }

  // Calculate cart total
  const cartTotal = cart.items.reduce((total, item) => total + item.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        error,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        fetchCart,
        cartTotal,
        itemCount: cart.items.length,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}


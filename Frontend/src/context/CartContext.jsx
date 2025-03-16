"use client"

import { createContext, useState, useEffect, useCallback, useRef } from "react"
import { cartService } from "../services/customer-api"

// Create the context with a default value
const CartContext = createContext(null)

// Separate the provider component
function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [] })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [cartTotal, setCartTotal] = useState(0)
  const isInitialMount = useRef(true)
  const isFetching = useRef(false)

  const calculateTotal = useCallback((items = []) => {
    return items.reduce((total, item) => total + (item.price || 0) * (item.quantity || 0), 0)
  }, [])

  const fetchCart = useCallback(async () => {
    // Use ref to prevent concurrent fetches and infinite loops
    if (isFetching.current) return

    isFetching.current = true
    setLoading(true)

    try {
      console.log("Fetching cart...")
      const response = await cartService.getCart()
      console.log("Cart response:", response)

      const cartData = response || { items: [] }

      if (!Array.isArray(cartData.items)) {
        cartData.items = []
      }

      setCart(cartData)
      setCartTotal(calculateTotal(cartData.items))
      return cartData
    } catch (err) {
      console.error("Error fetching cart:", err)
      setError("Failed to load your cart. Please try again.")
      return { items: [] }
    } finally {
      setLoading(false)
      isFetching.current = false
    }
  }, [calculateTotal])

  const addToCart = useCallback(
    async (item) => {
      setLoading(true)
      setError("")

      try {
        // Validate and transform input to match backend expectations
        if (!item.restaurantId) {
          console.error("Missing required field: restaurantId")
          setError("Unable to add item: missing restaurant information")
          setLoading(false)
          return null
        }

        if (!item.itemId && !item.menuItemId) {
          console.error("Missing required field: itemId or menuItemId")
          setError("Unable to add item: missing item information")
          setLoading(false)
          return null
        }

        // Create a properly formatted object that matches backend expectations
        const cartItemData = {
          restaurantId: item.restaurantId,
          menuItemId: item.menuItemId || item.itemId, // Support both naming conventions
          quantity: item.quantity || 1,
        }

        console.log("Adding item to cart:", cartItemData)
        const response = await cartService.addToCart(cartItemData)

        console.log("Add to cart response:", response)

        // Safely handle the response
        const updatedCart = response || { items: [] }

        // Safety check for items array
        if (!Array.isArray(updatedCart.items)) {
          updatedCart.items = []
        }

        setCart(updatedCart)
        setCartTotal(calculateTotal(updatedCart.items))
        return updatedCart
      } catch (err) {
        console.error("Error adding to cart:", err)
        setError("Failed to add item to cart. Please try again.")
        return null
      } finally {
        setLoading(false)
      }
    },
    [calculateTotal],
  )

  const updateCartItem = useCallback(
    async (itemId, quantity) => {
      setLoading(true)
      setError("")

      try {
        // Create the update data object expected by the API
        const updateData = { itemId, quantity }
        const response = await cartService.updateCartItem(updateData)

        // Handle response
        const updatedCart = response || { items: [] }
        if (!Array.isArray(updatedCart.items)) {
          updatedCart.items = []
        }

        setCart(updatedCart)
        setCartTotal(calculateTotal(updatedCart.items))
        return updatedCart
      } catch (err) {
        console.error("Error updating cart item:", err)
        setError("Failed to update item. Please try again.")
        return null
      } finally {
        setLoading(false)
      }
    },
    [calculateTotal],
  )

  const removeFromCart = useCallback(
    async (itemId) => {
      setLoading(true)
      setError("")

      try {
        const response = await cartService.removeFromCart(itemId)

        // Handle response
        const updatedCart = response || { items: [] }
        if (!Array.isArray(updatedCart.items)) {
          updatedCart.items = []
        }

        setCart(updatedCart)
        setCartTotal(calculateTotal(updatedCart.items))
        return updatedCart
      } catch (err) {
        console.error("Error removing from cart:", err)
        setError("Failed to remove item from cart. Please try again.")
        return null
      } finally {
        setLoading(false)
      }
    },
    [calculateTotal],
  )

  const clearCart = useCallback(async () => {
    setLoading(true)
    setError("")

    try {
      const response = await cartService.clearCart()

      // Handle response
      const emptyCart = response || { items: [] }
      if (!Array.isArray(emptyCart.items)) {
        emptyCart.items = []
      }

      setCart(emptyCart)
      setCartTotal(0)
      return emptyCart
    } catch (err) {
      console.error("Error clearing cart:", err)
      setError("Failed to clear cart. Please try again.")
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // Load cart ONLY ONCE on initial mount
  useEffect(() => {
    if (isInitialMount.current) {
      console.log("Initial mount - fetching cart")
      isInitialMount.current = false
      fetchCart().catch((err) => {
        console.error("Failed to fetch cart on mount:", err)
      })
    }

    // No dependency on fetchCart to prevent loops
  }, [])

  const value = {
    cart,
    loading,
    error,
    cartTotal,
    fetchCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// Export both the context and provider separately
export { CartContext, CartProvider }


import Cart from "../models/cart.js"
import Restaurant from "../models/restaurant.js"

// Get customer's cart
export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ customer: req.userId })

    // If cart doesn't exist, create a new one
    if (!cart) {
      cart = new Cart({
        customer: req.userId,
        items: [],
      })
      await cart.save()
    }

    res.status(200).json(cart)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message })
  }
}

// Add item to cart
export const addToCart = async (req, res) => {
  try {
    const { restaurantId, menuItemId, quantity } = req.body

    // Find the restaurant and menu item
    const restaurant = await Restaurant.findById(restaurantId)
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" })
    }

    const menuItem = restaurant.menu.id(menuItemId)
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" })
    }

    // Check if the item is available
    if (!menuItem.isAvailable) {
      return res.status(400).json({ message: "This item is currently unavailable" })
    }

    // Find or create cart
    let cart = await Cart.findOne({ customer: req.userId })
    if (!cart) {
      cart = new Cart({
        customer: req.userId,
        items: [],
      })
    }

    // Check if cart already has items from a different restaurant
    if (cart.items.length > 0 && cart.items[0].restaurant.toString() !== restaurantId) {
      return res.status(400).json({
        message:
          "Your cart contains items from a different restaurant. Clear your cart before adding items from a new restaurant.",
      })
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex((item) => item.menuItem.toString() === menuItemId)

    if (existingItemIndex > -1) {
      // Update quantity if item exists
      cart.items[existingItemIndex].quantity += quantity
    } else {
      // Add new item to cart
      cart.items.push({
        menuItem: menuItemId,
        name: menuItem.name,
        price: menuItem.price,
        quantity,
        restaurant: restaurantId,
        restaurantName: restaurant.name,
        image: menuItem.image,
      })
    }

    await cart.save()
    res.status(200).json(cart)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message })
  }
}

// Update cart item quantity
export const updateCartItem = async (req, res) => {
  try {
    const { itemId, quantity } = req.body

    if (quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" })
    }

    const cart = await Cart.findOne({ customer: req.userId })
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" })
    }

    const itemIndex = cart.items.findIndex((item) => item._id.toString() === itemId)
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" })
    }

    cart.items[itemIndex].quantity = quantity
    await cart.save()

    res.status(200).json(cart)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message })
  }
}

// Remove item from cart
export const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params

    const cart = await Cart.findOne({ customer: req.userId })
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" })
    }

    cart.items = cart.items.filter((item) => item._id.toString() !== itemId)
    await cart.save()

    res.status(200).json(cart)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message })
  }
}

// Clear cart
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ customer: req.userId })
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" })
    }

    cart.items = []
    await cart.save()

    res.status(200).json({ message: "Cart cleared successfully", cart })
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message })
  }
}


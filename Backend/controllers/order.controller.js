import Order from "../models/order.js"
import Cart from "../models/cart.js"
import Customer from "../models/customer.js"
import Restaurant from "../models/restaurant.js"

// Create a new order
export const createOrder = async (req, res) => {
  try {
    const { paymentMethod, deliveryAddress } = req.body

    // Get customer's cart
    const cart = await Cart.findOne({ customer: req.userId })
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty" })
    }

    // Get customer details
    const customer = await Customer.findById(req.userId)
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" })
    }

    // Calculate total amount
    const totalAmount = cart.items.reduce((total, item) => total + item.price * item.quantity, 0)

    // Create new order
    const order = new Order({
      customer: req.userId,
      restaurant: cart.items[0].restaurant, // Assuming all items are from the same restaurant
      items: cart.items.map((item) => ({
        menuItem: item.menuItem,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      })),
      totalAmount,
      deliveryAddress: deliveryAddress || customer.address,
      paymentMethod,
    })

    await order.save()

    // Clear the cart after order is placed
    cart.items = []
    await cart.save()

    res.status(201).json(order)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message })
  }
}

// Get customer's orders
export const getCustomerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.userId })
      .sort({ createdAt: -1 })
      .populate("restaurant", "name address")

    res.status(200).json(orders)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message })
  }
}

// Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("restaurant", "name address phone")

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    // Check if the order belongs to the customer
    if (order.customer.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized to view this order" })
    }

    res.status(200).json(order)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message })
  }
}

// Cancel order
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    // Check if the order belongs to the customer
    if (order.customer.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized to cancel this order" })
    }

    // Check if order can be cancelled (only pending or confirmed orders can be cancelled)
    if (order.status !== "pending" && order.status !== "confirmed") {
      return res.status(400).json({ message: "This order cannot be cancelled" })
    }

    order.status = "cancelled"
    await order.save()

    res.status(200).json(order)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message })
  }
}

// Get restaurant orders (for restaurant owners)
export const getRestaurantOrders = async (req, res) => {
  try {
    // Check if user is a restaurant owner
    if (req.userRole !== "owner") {
      return res.status(403).json({ message: "Not authorized" })
    }

    // Get restaurant owned by the user
    const restaurant = await Restaurant.findOne({ owner: req.userId })
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" })
    }

    const orders = await Order.find({ restaurant: restaurant._id })
      .sort({ createdAt: -1 })
      .populate("customer", "name email phone")

    res.status(200).json(orders)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message })
  }
}

// Update order status (for restaurant owners)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body

    // Check if user is a restaurant owner
    if (req.userRole !== "owner") {
      return res.status(403).json({ message: "Not authorized" })
    }

    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    // Check if the restaurant belongs to the owner
    const restaurant = await Restaurant.findOne({ owner: req.userId })
    if (!restaurant || restaurant._id.toString() !== order.restaurant.toString()) {
      return res.status(403).json({ message: "Not authorized to update this order" })
    }

    // Validate status transition
    const validStatusTransitions = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["preparing", "cancelled"],
      preparing: ["out_for_delivery"],
      out_for_delivery: ["delivered"],
      delivered: [],
      cancelled: [],
    }

    if (!validStatusTransitions[order.status].includes(status)) {
      return res.status(400).json({
        message: `Cannot change status from ${order.status} to ${status}`,
        validTransitions: validStatusTransitions[order.status],
      })
    }

    order.status = status
    await order.save()

    res.status(200).json(order)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message })
  }
}


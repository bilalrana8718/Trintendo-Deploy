import jwt from "jsonwebtoken"
import Customer from "../models/customer.js"
import Cart from "../models/cart.js"

// Register a new customer
export const registerCustomer = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body

    // Check if customer already exists
    const existingCustomer = await Customer.findOne({ email })
    if (existingCustomer) {
      return res.status(400).json({ message: "Email already registered" })
    }

    // Create new customer
    const customer = new Customer({
      name,
      email,
      password,
      phone,
      address,
    })

    await customer.save()

    // Create an empty cart for the customer
    const cart = new Cart({
      customer: customer._id,
      items: [],
    })

    await cart.save()

    // Generate JWT token
    const token = jwt.sign({ id: customer._id, email: customer.email, role: "customer" }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    })

    res.status(201).json({
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
      },
      token,
    })
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message })
  }
}

// Login customer
export const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body

    // Validate email and password are provided
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" })
    }

    // Find customer by email
    const customer = await Customer.findOne({ email })
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" })
    }

    // Check password
    const isPasswordCorrect = await customer.comparePassword(password)
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Generate JWT token
    const token = jwt.sign({ id: customer._id, email: customer.email, role: "customer" }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    })

    res.status(200).json({
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
      },
      token,
    })
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message })
  }
}

// Get current customer
export const getCurrentCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.userId).select("-password")
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" })
    }

    res.status(200).json(customer)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message })
  }
}

// Update customer profile
export const updateCustomerProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body

    const customer = await Customer.findById(req.userId)
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" })
    }

    // Validate phone number format if provided
    if (phone && !/^[0-9]{10,15}$/.test(phone)) {
      return res.status(400).json({ message: "Invalid phone number format" })
    }

    customer.name = name || customer.name
    customer.phone = phone || customer.phone
    customer.address = address || customer.address

    await customer.save()

    res.status(200).json({
      id: customer._id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
    })
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message })
  }
}


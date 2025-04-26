import jwt from "jsonwebtoken"
import User from "../models/user.js"

// Register a new user
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" })
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
    })

    await user.save()

    // Generate JWT token
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    })

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    })
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message })
  }
}

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user by email
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Check password
    const isPasswordCorrect = await user.comparePassword(password)
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    })

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    })
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message })
  }
}

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password")
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.status(200).json(user)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message })
  }
}


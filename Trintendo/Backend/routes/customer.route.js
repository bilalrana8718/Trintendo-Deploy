import express from "express"
import {
  registerCustomer,
  loginCustomer,
  getCurrentCustomer,
  updateCustomerProfile,
} from "../controllers/customer.controller.js"
import customerAuth from "../middleware/customer.middleware.js"

const router = express.Router()

// Public routes
router.post("/register", registerCustomer)
router.post("/login", loginCustomer)

// Protected routes
router.get("/me", customerAuth, getCurrentCustomer)
router.patch("/profile", customerAuth, updateCustomerProfile)

export default router


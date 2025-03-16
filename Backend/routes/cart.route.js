import express from "express"
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from "../controllers/cart.controller.js"
import customerAuth from "../middleware/customer.middleware.js"

const router = express.Router()

// All cart routes are protected
router.use(customerAuth)

router.get("/", getCart)
router.post("/add", addToCart)
router.patch("/update", updateCartItem)
router.delete("/item/:itemId", removeFromCart)
router.delete("/clear", clearCart)

export default router


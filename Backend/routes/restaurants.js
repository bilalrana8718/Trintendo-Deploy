import express from "express"
import {
  createRestaurant,
  getAllRestaurants,
  getRestaurantsByOwner,
  getRestaurantById,
  updateRestaurant,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "../controllers/restaurants.js"
import auth from "../middleware/auth.js"

const router = express.Router()

// Public routes
router.get("/", getAllRestaurants)
router.get("/:id", getRestaurantById)

// Protected routes
router.post("/", auth, createRestaurant)
router.get("/owner/me", auth, getRestaurantsByOwner)
router.patch("/:id", auth, updateRestaurant)
router.post("/:id/menu", auth, addMenuItem)
router.patch("/:id/menu/:itemId", auth, updateMenuItem)
router.delete("/:id/menu/:itemId", auth, deleteMenuItem)

export default router


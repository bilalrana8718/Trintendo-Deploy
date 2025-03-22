import express from "express";
import {
  createOrder,
  getCustomerOrders,
  getOrderById,
  cancelOrder,
  getRestaurantOrders,
  updateOrderStatus,
} from "../controllers/order.controller.js";
import customerAuth from "../middleware/customer.middleware.js";
import auth from "../middleware/auth.middleware.js";

const router = express.Router();

// Customer routes
router.post("/", customerAuth, createOrder);
router.get("/customer", customerAuth, getCustomerOrders);
router.get("/customer/:id", customerAuth, getOrderById);
router.patch("/customer/:id/cancel", customerAuth, cancelOrder);

// Restaurant owner routes
router.get("/restaurant", auth, getRestaurantOrders);
router.patch("/restaurant/:id/status", auth, updateOrderStatus);

export default router;

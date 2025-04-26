import express from "express";
import {
  getDeliveryRequests,
  acceptDeliveryRequest,
  declineDeliveryRequest,
  updateLocation,
  updateStatus,
  registerRider,
  loginRider,
  getRiderStatus,
  updateDeliveryStatus,
  getActiveDelivery,
} from "../controllers/rider.controller.js";
import auth from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerRider);
router.post("/login", loginRider);

// Protected routes
router.use(auth);
router.get("/status", getRiderStatus);
router.get("/active-delivery", getActiveDelivery);
router.get("/delivery-requests", getDeliveryRequests);
router.post("/delivery-requests/:orderId/accept", acceptDeliveryRequest);
router.post("/delivery-requests/:orderId/decline", declineDeliveryRequest);
router.post("/active-delivery/:orderId/status", updateDeliveryStatus);
router.post("/location", updateLocation);
router.post("/status", updateStatus);

export default router; 
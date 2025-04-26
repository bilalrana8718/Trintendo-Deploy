import Rider from "../models/rider.js";
import Order from "../models/order.js";
import Restaurant from "../models/restaurant.js";
import User from "../models/user.js";
import jwt from "jsonwebtoken";

// Register a new rider
export const registerRider = async (req, res) => {
  try {
    const { name, email, password, phone, vehicleType, vehicleNumber } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Create new user with rider role
    const user = new User({
      name,
      email,
      password,
      role: "rider",
    });

    await user.save();

    // Create rider profile
    const rider = new Rider({
      user: user._id,
      name,
      email,
      phone,
      vehicleType,
      vehicleNumber,
    });

    await rider.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      rider: {
        id: rider._id,
        name: rider.name,
        email: rider.email,
        phone: rider.phone,
        vehicleType: rider.vehicleType,
        vehicleNumber: rider.vehicleNumber,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};

// Login rider
export const loginRider = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Rider not found" });
    }

    // Check if user is a rider
    if (user.role !== "rider") {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Check password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Find rider profile
    const rider = await Rider.findOne({ user: user._id });
    if (!rider) {
      return res.status(404).json({ message: "Rider profile not found" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      rider: {
        id: rider._id,
        name: rider.name,
        email: rider.email,
        phone: rider.phone,
        vehicleType: rider.vehicleType,
        vehicleNumber: rider.vehicleNumber,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};

// Get available delivery requests for riders
export const getDeliveryRequests = async (req, res) => {
  try {
    // Check if user is a rider
    const rider = await Rider.findOne({ user: req.userId });
    if (!rider) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Get orders that are ready for pickup
    const orders = await Order.find({
      status: "ready_for_pickup",
      rider: { $exists: false }, // Orders not yet assigned to any rider
      $or: [
        { declinedRiders: { $ne: rider._id } }, // Orders not declined by this rider
        { declinedRiders: { $exists: false } }  // Orders with no declined riders
      ]
    })
      .populate("restaurant", "name address")
      .populate("customer", "name phone");

    console.log('Available delivery requests:', orders.length);
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error getting delivery requests:', error);
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};

// Accept a delivery request
export const acceptDeliveryRequest = async (req, res) => {
  try {
    const { orderId } = req.params;
    console.log(`Rider ${req.userId} attempting to accept order ${orderId}`);

    // Check if user is a rider
    const rider = await Rider.findOne({ user: req.userId });
    if (!rider) {
      console.log(`User ${req.userId} not authorized as rider`);
      return res.status(403).json({ message: "Not authorized as rider" });
    }

    // Check if rider is available
    if (rider.status !== "available") {
      console.log(`Rider ${rider._id} is not available (current status: ${rider.status})`);
      return res.status(400).json({ message: `Cannot accept orders while status is ${rider.status}` });
    }

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      console.log(`Order ${orderId} not found`);
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if order is ready for delivery
    if (order.status !== "ready_for_pickup") {
      console.log(`Order ${orderId} is not ready for pickup (status: ${order.status})`);
      return res.status(400).json({ message: "Order is not ready for pickup" });
    }

    // Check if order is already assigned to a rider
    if (order.rider) {
      console.log(`Order ${orderId} is already assigned to rider ${order.rider}`);
      return res.status(400).json({ message: "This order has already been taken by another rider" });
    }

    // Update order with rider information
    order.rider = rider._id;
    order.status = "picked_up";
    await order.save();
    console.log(`Order ${orderId} assigned to rider ${rider._id} and marked as picked up`);

    // Update rider status to busy
    rider.status = "busy";
    await rider.save();
    console.log(`Rider ${rider._id} status updated to busy`);

    // Populate order details before sending response
    await order.populate("restaurant", "name address");
    await order.populate("customer", "name phone");

    res.status(200).json({ 
      message: "Delivery request accepted successfully", 
      order 
    });
  } catch (error) {
    console.error("Error in acceptDeliveryRequest:", error);
    res.status(500).json({ 
      message: "Failed to accept delivery request", 
      error: error.message 
    });
  }
};

// Decline a delivery request
export const declineDeliveryRequest = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Check if user is a rider
    const rider = await Rider.findOne({ user: req.userId });
    if (!rider) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if order is ready for delivery
    if (order.status !== "out_for_delivery") {
      return res.status(400).json({ message: "Order is not ready for delivery" });
    }

    // Add rider to declined riders list to prevent showing the same order again
    if (!order.declinedRiders) {
      order.declinedRiders = [];
    }
    order.declinedRiders.push(rider._id);
    await order.save();

    res.status(200).json({ message: "Delivery request declined" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};

// Update rider's current location
export const updateLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    // Check if user is a rider
    const rider = await Rider.findOne({ user: req.userId });
    if (!rider) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Update rider's location
    rider.currentLocation = {
      type: "Point",
      coordinates: [longitude, latitude],
    };
    await rider.save();

    res.status(200).json({ message: "Location updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};

// Update rider's status
export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // Check if user is a rider
    const rider = await Rider.findOne({ user: req.userId });
    if (!rider) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Update rider's status
    rider.status = status;
    await rider.save();

    res.status(200).json({ message: "Status updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};

// Get rider's status
export const getRiderStatus = async (req, res) => {
  try {
    // Check if user is a rider
    const rider = await Rider.findOne({ user: req.userId });
    if (!rider) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.status(200).json({ status: rider.status });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};

export const updateDeliveryStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    console.log(`Updating delivery status for order ${orderId} to ${status}`);

    // Check if user is a rider
    const rider = await Rider.findOne({ user: req.userId });
    if (!rider) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Find the order assigned to this rider
    const order = await Order.findOne({
      _id: orderId,
      rider: rider._id
    });

    if (!order) {
      console.log(`Order ${orderId} not found or not assigned to rider ${rider._id}`);
      return res.status(404).json({ message: "Order not found or not assigned to you" });
    }

    // Validate status transition
    const validTransitions = {
      picked_up: ["in_transit"],
      in_transit: ["near_delivery"],
      near_delivery: ["delivered"],
    };

    if (!validTransitions[order.status]?.includes(status)) {
      console.log(`Invalid status transition from ${order.status} to ${status}`);
      return res.status(400).json({
        message: `Cannot change status from ${order.status} to ${status}`,
        validTransitions: validTransitions[order.status] || []
      });
    }

    // Update both status fields
    order.status = status;
    order.deliveryStatus = status;

    // Add to status history
    order.statusHistory.push({
      status,
      timestamp: new Date()
    });

    await order.save();
    console.log(`Successfully updated order ${orderId} status to ${status}`);

    // If order is delivered, update rider status to available
    if (status === "delivered") {
      rider.status = "available";
      await rider.save();
      console.log(`Updated rider ${rider._id} status to available`);
    }

    res.json({
      message: "Delivery status updated successfully",
      order
    });
  } catch (error) {
    console.error("Error updating delivery status:", error);
    res.status(500).json({ message: "Error updating delivery status", error: error.message });
  }
};

export const getActiveDelivery = async (req, res) => {
  try {
    // Check if user is a rider
    const rider = await Rider.findOne({ user: req.userId });
    if (!rider) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Find active delivery (order assigned to this rider that isn't delivered)
    const activeDelivery = await Order.findOne({
      rider: rider._id,
      status: { $nin: ['delivered', 'cancelled'] }
    })
    .populate("restaurant", "name address")
    .populate("customer", "name phone");

    if (!activeDelivery) {
      return res.status(404).json({ message: "No active delivery found" });
    }

    res.status(200).json(activeDelivery);
  } catch (error) {
    console.error("Error fetching active delivery:", error);
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
}; 
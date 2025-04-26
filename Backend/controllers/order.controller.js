import Order from "../models/order.js";
import Cart from "../models/cart.js";
import Customer from "../models/customer.js";
import Restaurant from "../models/restaurant.js";

// Create a new order
export const createOrder = async (req, res) => {
  try {
    const { paymentMethod, deliveryAddress } = req.body;

    // Get customer's cart
    const cart = await Cart.findOne({ customer: req.userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty" });
    }

    // Get customer details
    const customer = await Customer.findById(req.userId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Calculate total amount
    const totalAmount = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

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
    });

    await order.save();

    // Clear the cart after order is placed
    cart.items = [];
    await cart.save();

    res.status(201).json(order);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

// Get customer's orders
export const getCustomerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.userId })
      .sort({ createdAt: -1 })
      .populate("restaurant", "name address");

    res.status(200).json(orders);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

// Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "restaurant",
      "name address phone"
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if the order belongs to the customer
    if (order.customer.toString() !== req.userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this order" });
    }

    res.status(200).json(order);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

// Cancel order
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if the order belongs to the customer
    if (order.customer.toString() !== req.userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to cancel this order" });
    }

    // Check if order can be cancelled (only pending or confirmed orders can be cancelled)
    if (order.status !== "pending" && order.status !== "confirmed") {
      return res
        .status(400)
        .json({ message: "This order cannot be cancelled" });
    }

    order.status = "cancelled";
    await order.save();

    res.status(200).json(order);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

// Get restaurant orders (for restaurant owners)
export const getRestaurantOrders = async (req, res) => {
  try {
    // Check if user is a restaurant owner
    if (req.userRole !== "owner") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const restaurants = await Restaurant.find({ owner: req.userId });

    if (!restaurants.length) {
      return res.status(404).json({ message: "No restaurants found" });
    }

    // Get orders for all owned restaurants
    const restaurantIds = restaurants.map((restaurant) => restaurant._id);

    const orders = await Order.find({ restaurant: { $in: restaurantIds } })
      .sort({ createdAt: -1 })
      .populate("customer", "name email phone");

    console.log(orders);
    res.status(200).json(orders);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};
// Get order analytics for restaurant owners
export const getOrderAnalytics = async (req, res) => {
  try {
    // Check if user is a restaurant owner
    if (req.userRole !== "owner") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const restaurants = await Restaurant.find({ owner: req.userId });

    if (!restaurants.length) {
      return res.status(404).json({ message: "No restaurants found" });
    }

    // Get orders for all owned restaurants
    const restaurantIds = restaurants.map((restaurant) => restaurant._id);

    // Get all orders for analytics
    const orders = await Order.find({ restaurant: { $in: restaurantIds } })
      .sort({ createdAt: -1 });

    // Calculate analytics
    const analytics = {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + order.totalAmount, 0),
      activeOrders: orders.filter(order => 
        order.status !== "delivered" && order.status !== "cancelled"
      ).length,
      ordersByStatus: {
        pending: orders.filter(order => order.status === "pending").length,
        confirmed: orders.filter(order => order.status === "confirmed").length,
        preparing: orders.filter(order => order.status === "preparing").length,
        out_for_delivery: orders.filter(order => order.status === "out_for_delivery").length,
        delivered: orders.filter(order => order.status === "delivered").length,
        cancelled: orders.filter(order => order.status === "cancelled").length
      },
      // Calculate popular items
      popularItems: calculatePopularItems(orders)
    };

    res.status(200).json(analytics);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};

// Helper function to calculate popular items
const calculatePopularItems = (orders) => {
  const itemsMap = {};

  // Count occurrences of each menu item
  orders.forEach(order => {
    order.items.forEach(item => {
      if (!itemsMap[item.menuItem]) {
        itemsMap[item.menuItem] = {
          name: item.name,
          count: 0,
          revenue: 0
        };
      }
      itemsMap[item.menuItem].count += item.quantity;
      itemsMap[item.menuItem].revenue += item.price * item.quantity;
    });
  });

  // Convert to array and sort by count
  const popularItems = Object.values(itemsMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Get top 5

  return popularItems;
};

// Update order status (for restaurant owners)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    console.log('Update Order Status Request:', {
      orderId: req.params.id,
      newStatus: status,
      userRole: req.userRole,
      userId: req.userId
    });

    // Check if user is a restaurant owner
    if (req.userRole !== "owner") {
      console.log('Authorization failed: User is not an owner', { userRole: req.userRole });

      return res.status(403).json({ message: "Not authorized" });
    }

    // Find the order by ID
    const order = await Order.findById(req.params.id);
    if (!order) {
      console.log('Order not found:', req.params.id);
      return res.status(404).json({ message: "Order not found" });
    }
    console.log('Found order:', { orderId: order._id, currentStatus: order.status, restaurantId: order.restaurant });

    // Get all restaurants owned by the user
    const restaurants = await Restaurant.find({ owner: req.userId });
    console.log('Found restaurants:', { count: restaurants.length, restaurantIds: restaurants.map(r => r._id) });

    if (!restaurants.length) {
      console.log('No restaurants found for owner:', req.userId);

      return res
        .status(403)
        .json({ message: "Not authorized to update this order" });
    }

    // Extract restaurant IDs
    const restaurantIds = restaurants.map((restaurant) =>
      restaurant._id.toString()
    );

    // Check if the order belongs to any of the owner's restaurants
    const orderRestaurantId = order.restaurant.toString();
    console.log('Checking restaurant authorization:', {
      orderRestaurantId,
      ownerRestaurantIds: restaurantIds,
      matches: restaurantIds.includes(orderRestaurantId)
    });

    if (!restaurantIds.includes(orderRestaurantId)) {

      return res
        .status(403)
        .json({ message: "Not authorized to update this order" });
    }

    // Validate status transition
    const validStatusTransitions = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["preparing", "cancelled"],
      preparing: ["ready_for_pickup"],
      ready_for_pickup: [], // Restaurant owner cannot change status after ready_for_pickup
      picked_up: ["in_transit"],
      in_transit: ["near_delivery"],
      near_delivery: ["delivered"],

      delivered: [],
      cancelled: [],
    };

    console.log('Validating status transition:', {
      currentStatus: order.status,
      newStatus: status,
      validTransitions: validStatusTransitions[order.status]
    });

    if (!validStatusTransitions[order.status].includes(status)) {
      return res.status(400).json({
        message: `Cannot change status from ${order.status} to ${status}`,
        validTransitions: validStatusTransitions[order.status],
      });
    }

    // Update order status
    order.status = status;
    await order.save();
    console.log('Order status updated successfully:', { orderId: order._id, newStatus: status });

    res.status(200).json(order);
  } catch (error) {
    console.error('Error in updateOrderStatus:', error);

    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

// Add a review to an order
export const addOrderReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    // Find the order
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if the order belongs to the customer
    if (order.customer.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized to review this order" });
    }

    // Check if the order is delivered
    if (order.status !== "delivered") {
      return res.status(400).json({ message: "Can only review delivered orders" });
    }

    // Check if the order already has a review
    if (order.review && order.review.rating) {
      return res.status(400).json({ message: "Order already has a review" });
    }

    // Update the order with the review using findByIdAndUpdate
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      {
        $set: {
          review: {
            rating: Number(rating),
            comment: comment || "",
            createdAt: new Date()
          },
          updatedAt: new Date()
        }
      },
      { new: true }
    );

    res.status(200).json({ message: "Review added successfully", order: updatedOrder });
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};

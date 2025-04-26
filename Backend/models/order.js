import mongoose from "mongoose"

const orderItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  image: String,
})

const deliveryStatusSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  location: {
    latitude: Number,
    longitude: Number,
  },
  note: String,
})

const orderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true,
  },
  rider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Rider",
  },
  declinedRiders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Rider",
  }],
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: [
      "pending",
      "confirmed",
      "preparing",
      "ready_for_pickup",
      "picked_up",
      "in_transit",
      "near_delivery",
      "delivered",
      "cancelled"
    ],
    default: "pending",
  },
  deliveryStatus: {
    type: String,
    enum: [
      "pending",
      "assigned",
      "picked_up",
      "in_transit",
      "near_delivery",
      "delivered"
    ],
    default: "pending"
  },
  statusHistory: [deliveryStatusSchema],
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
  },
  paymentMethod: {
    type: String,
    enum: ["cash", "card"],
    default: "cash",
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },
  stripeSessionId: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  review: {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    comment: {
      type: String,
      trim: true,
      default: ""
    },
    createdAt: {
      type: Date,
      default: Date.now,
    }
  }
})

// Update the updatedAt field before saving
orderSchema.pre("save", function (next) {
  this.updatedAt = Date.now()
  next()
})

// Add status to history when status changes
orderSchema.pre("save", function (next) {
  if (this.isModified("deliveryStatus")) {
    this.statusHistory.push({
      status: this.deliveryStatus,
      timestamp: new Date(),
    });
  }
  next();
});

const Order = mongoose.model("Order", orderSchema)

export default Order
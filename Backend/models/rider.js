import mongoose from "mongoose";

const riderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },    
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ["available", "busy", "offline"],
    default: "offline",
  },
  currentLocation: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      default: [0, 0],
    },
  },
  vehicleType: {
    type: String,
    enum: ["bicycle", "motorcycle", "car"],
    required: true,
  },
  vehicleNumber: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  totalDeliveries: {
    type: Number,
    default: 0,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create a 2dsphere index for geospatial queries
riderSchema.index({ currentLocation: "2dsphere" });

// Update the updatedAt field before saving
riderSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Rider = mongoose.model("Rider", riderSchema);

export default Rider; 
import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import restaurantRoutes from "./routes/restaurants.route.js";
import customerRoutes from "./routes/customer.route.js";
import cartRoutes from "./routes/cart.route.js";
import orderRoutes from "./routes/order.route.js";
import paymentRoutes from "./routes/payment.route.js";
import riderRoutes from "./routes/rider.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware

app.use(express.json({ verify: (req, res, buf) => {
  // Save the raw body for webhook verification
  if (req.originalUrl === '/api/payments/webhook') {
    req.rawBody = buf.toString();
  }
}}));
app.use(morgan("dev"));
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/rider", riderRoutes);
app.get('/health', (req, res) => res.send('API is healthy'));


app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});


// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
  })
  .catch((error) => console.log("MongoDB connection error:", error.message));

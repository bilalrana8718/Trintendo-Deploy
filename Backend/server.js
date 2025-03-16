import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.js"
import restaurantRoutes from "./routes/restaurants.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(express.json())
app.use(cors())

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/restaurants", restaurantRoutes)

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB")
    app.listen(PORT, () => console.log(`Server running on port: ${PORT}`))
  })
  .catch((error) => console.log("MongoDB connection error:", error.message))


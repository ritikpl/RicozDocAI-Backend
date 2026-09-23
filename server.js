const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
require("dotenv").config()

const uploadRoutes = require("./routes/uploadRoutes")
const documentRoutes = require("./routes/documentRoutes")

const app = express()


// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://ricozdocai-frontend.vercel.app",
    ],
  })
)
app.use(express.json())

app.use("/api/upload", uploadRoutes)
app.use("/api/documents", documentRoutes)

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully")
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message)
  })

// Test Route
app.get("/", (req, res) => {
  res.json({
    message: "RicozDocAI Backend is running",
  })
})

app.get("/api/cloudinary-test", async (req, res) => {
  try {
    const cloudinary = require("./config/cloudinary")

    const result = await cloudinary.api.ping()

    res.json({
      success: true,
      message: "Cloudinary connection working",
      result,
    })
  } catch (error) {
    console.error("Cloudinary test error:", error)

    res.status(500).json({
      success: false,
      message: "Cloudinary connection failed",
      error: error.message,
    })
  }
})

// Server
const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
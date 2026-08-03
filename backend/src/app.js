const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const { rateLimit } = require("express-rate-limit");

const app = express();

// Remove the Express identification header
app.disable("x-powered-by");

// Security headers
app.use(helmet());

// Allow the frontend to communicate with the backend
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Parse incoming JSON and form data
app.use(express.json({ limit: "10mb" }));
app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

// Parse cookies
app.use(cookieParser());

// Request logging
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Protect the API from excessive requests
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

app.use("/api", apiLimiter);

// Health-check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Portfolio CMS API is running",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

// Handle routes that do not exist
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error(error);

  const statusCode = error.statusCode || error.status || 500;

  res.status(statusCode).json({
    success: false,
    message:
      statusCode === 500
        ? "An internal server error occurred."
        : error.message,
    ...(process.env.NODE_ENV === "development" && {
      error: error.message,
    }),
  });
});

module.exports = app;
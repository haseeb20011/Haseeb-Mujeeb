const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const { rateLimit } = require("express-rate-limit");

const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const messageRoutes = require("./routes/messageRoutes");
const siteConfigRoutes = require("./routes/siteConfigRoutes");
const mediaRoutes = require("./routes/mediaRoutes");
const activityRoutes = require("./routes/activityRoutes");

const auditActivity = require("./middleware/auditActivity");
const connectDatabase = require("./config/database");

const app = express();

app.disable("x-powered-by");

app.use(helmet());

const isAllowedOrigin = (origin) => {
  if (!origin) return true;

  if (origin === process.env.CLIENT_URL) {
    return true;
  }

  if (
    process.env.NODE_ENV !== "production" &&
    /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)
  ) {
    return true;
  }

  return false;
};

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

app.use(
  morgan(
    process.env.NODE_ENV === "production"
      ? "combined"
      : "dev"
  )
);

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

/*
  Vercel runs this Express app as a function. Connect to MongoDB
  on API requests instead of relying only on server.js startup.
  The connection helper reuses an existing/in-flight connection.
*/
app.use("/api", async (req, res, next) => {
  if (req.path === "/health") {
    return next();
  }

  try {
    await connectDatabase();
    return next();
  } catch (error) {
    return next(error);
  }
});

const contactFormLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many messages were submitted. Please wait and try again.",
  },
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);

app.use(
  "/api/messages",
  (req, res, next) => {
    if (req.method === "POST") {
      return contactFormLimiter(req, res, next);
    }

    return next();
  },
  auditActivity("message"),
  messageRoutes
);

app.use(
  "/api/site-config",
  auditActivity("site-config"),
  siteConfigRoutes
);

app.use("/api/media", mediaRoutes);
app.use("/api/activity", activityRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Portfolio CMS API is running",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use((error, req, res, next) => {
  console.error(error);

  const statusCode =
    error.statusCode ||
    error.status ||
    (error.message?.startsWith("CORS blocked") ? 403 : 500);

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

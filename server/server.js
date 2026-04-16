const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const { connectDB } = require("./config/db");
const { errorHandler } = require("./utils/errorHandler");
const logger = require("./utils/logger");

// 🔥 CREATE APP
const app = express();

// ================= DATABASE =================
connectDB();

// ================= SECURITY MIDDLEWARE =================
// Helmet for security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting for API endpoints
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Limit login attempts
  message: "Too many login attempts, please try again later.",
  skipSuccessfulRequests: true,
});

// Apply rate limiting
app.use("/api/", limiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// ================= STANDARD MIDDLEWARE =================
// Compression middleware
app.use(compression());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || [
    "http://localhost:3000",
    "http://localhost:5000",
    "https://vasutripathi.github.io",
    "https://watchverse.netlify.app", // For future Netlify deployment
    "https://watchverse.vercel.app", // For future Vercel deployment
  ],
  credentials: true,
  optionsSuccessStatus: 200,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const startTime = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// ================= ROUTES =================
// API v1 routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/watchlist", require("./routes/watchlistRoutes"));
app.use("/api/activity", require("./routes/activityRoutes"));
app.use("/api/recommendations", require("./routes/recommendationsRoutes"));
app.use("/api/search", require("./routes/searchRoutes"));
app.use("/api/ai", require("./routes/aiRoutes"));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Test route
app.get("/", (req, res) => {
  res.status(200).json({
    name: "Watchverse Backend",
    version: "1.0.0",
    status: "running",
    environment: process.env.NODE_ENV || "development",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path,
  });
});

// ================= ERROR HANDLER =================
app.use(errorHandler);

// ================= GRACEFUL SHUTDOWN =================
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { promise, reason });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// ================= START SERVER =================
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📦 Environment: ${NODE_ENV}`);
});

// Handle server errors
server.on('error', (error) => {
  logger.error('Server error:', error);
  process.exit(1);
});

module.exports = app;
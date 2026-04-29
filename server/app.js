const express = require("express");
const helmet = require("helmet");
const compression = require("compression");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const rateLimit = require("express-rate-limit");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const app = express();

// Routes import
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/auth.routes");
const facilityRoutes = require("./routes/facilityRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");

const isProduction = process.env.NODE_ENV === "production";
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:3001")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.set("trust proxy", 1);

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(compression());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isProduction ? 300 : 1000,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "/assets")));

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/facilities", facilityRoutes);
app.use("/api/appointments", appointmentRoutes);

// Centralized error fallback
app.use((err, _req, res, _next) => {
  const message = isProduction ? "Internal server error" : err.message;
  res.status(err.status || 500).json({ error: message });
});

module.exports = app;
import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/authRoutes.js";
import qrRoutes from "./routes/qrRoutes.js";

const app = express();

// Global Middlewares
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
  })
);
app.use(express.json());

// Health Check Endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Mounting API Routes
app.use("/api/auth", authRoutes);
app.use("/api/qr", qrRoutes);

// Global 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found.` });
});

// Global Error Handler
app.use((err, req, res, _next) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({ error: "Internal Server Error", details: err.message });
});

export default app;

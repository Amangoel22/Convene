import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/authRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import stageRoutes from "./routes/stageRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import participantRoutes from "./routes/participantRoutes.js";
import qrRoutes from "./routes/qrRoutes.js";

const app = express();

// Global Middlewares
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://unpkg.com"]
      }
    }
  })
);
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow local development ports 5000 and 5173 or CLIENT_URL
      if (!origin || origin.includes("localhost:5000") || origin.includes("localhost:5173") || origin === process.env.CLIENT_URL) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true
  })
);
app.use(express.json());

// Root Welcome Endpoint
app.get("/", (req, res) => {
  res.status(200).json({ message: "Convene Backend API is running.", version: "0.1.0", docs: "/docs" });
});

// Health Check Endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Interactive API Documentation Endpoint (/docs)
app.get("/docs", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Convene API Documentation</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  <style>
    body { margin: 0; padding: 0; background: #fafafa; }
    .swagger-ui .topbar { display: none; }
    .swagger-ui { font-family: system-ui, -apple-system, sans-serif; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    window.onload = () => {
      window.ui = SwaggerUIBundle({
        spec: {
          openapi: "3.0.0",
          info: {
            title: "Convene Multi-Tenant Event Portal API",
            version: "0.1.0",
            description: "Interactive OpenAPI documentation for Convene backend endpoints."
          },
          servers: [{ url: "http://localhost:8000", description: "Local API Server" }],
          paths: {
            "/health": {
              get: {
                summary: "Server Health Check",
                responses: { "200": { description: "Server is healthy" } }
              }
            },
            "/api/auth/register": {
              post: {
                summary: "Register New User Account",
                requestBody: {
                  required: true,
                  content: {
                    "application/json": {
                      schema: {
                        type: "object",
                        required: ["name", "email", "password"],
                        properties: {
                          name: { type: "string", example: "Aman Goel" },
                          email: { type: "string", example: "aman@example.com" },
                          password: { type: "string", example: "securepassword123" },
                          phone: { type: "string", example: "+91 9876543210" }
                        }
                      }
                    }
                  }
                },
                responses: { "201": { description: "User account created with JWT token" } }
              }
            },
            "/api/auth/login": {
              post: {
                summary: "User Login",
                requestBody: {
                  required: true,
                  content: {
                    "application/json": {
                      schema: {
                        type: "object",
                        required: ["email", "password"],
                        properties: {
                          email: { type: "string", example: "aman@example.com" },
                          password: { type: "string", example: "securepassword123" }
                        }
                      }
                    }
                  }
                },
                responses: { "200": { description: "Authentication successful, returns JWT token" } }
              }
            },
            "/api/auth/me": {
              get: {
                summary: "Get Authenticated User Profile",
                security: [{ BearerAuth: [] }],
                responses: { "200": { description: "Current authenticated profile object" } }
              }
            },
            "/api/qr/verify": {
              post: {
                summary: "Verify Participant Scanned QR Token",
                security: [{ BearerAuth: [] }],
                requestBody: {
                  required: true,
                  content: {
                    "application/json": {
                      schema: {
                        type: "object",
                        required: ["qrToken"],
                        properties: {
                          qrToken: { type: "string", example: "secure_random_qr_token_string" }
                        }
                      }
                    }
                  }
                },
                responses: { "200": { description: "Returns participant registration and check-in details" } }
              }
            }
          },
          components: {
            securitySchemes: {
              BearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT"
              }
            }
          }
        },
        dom_id: "#swagger-ui"
      });
    };
  </script>
</body>
</html>
  `);
});

// Mounting API Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/stages", stageRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/participants", participantRoutes);
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

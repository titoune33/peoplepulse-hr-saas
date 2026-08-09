import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { authRoutes } from "./routes/auth.js";
import { employeeRoutes } from "./routes/employees.js";
import { insightRoutes } from "./routes/insights.js";
import { reportRoutes } from "./routes/reports.js";
import { stripeRoutes } from "./routes/stripe.js";

const app = new Hono();

const PORT = parseInt(process.env.PORT || "3002", 10);
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3001";

// CORS configuration
app.use(
  "*",
  cors({
    origin: [FRONTEND_URL, "http://localhost:3001", "http://localhost:3000"],
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Content-Length"],
    maxAge: 86400,
    credentials: true,
  })
);

// Health check
app.get("/api/health", (c) => {
  return c.json({
    success: true,
    data: {
      status: "ok",
      timestamp: new Date().toISOString(),
    },
  });
});

// Mount routes
app.route("/api/auth", authRoutes);
app.route("/api/employees", employeeRoutes);
app.route("/api/insights", insightRoutes);
app.route("/api/reports", reportRoutes);
app.route("/api/stripe", stripeRoutes);

// Global error handler
app.onError((err, c) => {
  console.error("Unhandled error:", err);
  return c.json(
    {
      success: false,
      error:
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : err.message,
    },
    500
  );
});

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: `Route not found: ${c.req.method} ${c.req.path}`,
    },
    404
  );
});

console.log(`Starting PeoplePulse backend server...`);

serve(
  {
    fetch: app.fetch,
    port: PORT,
  },
  (info) => {
    console.log(`Server running on http://localhost:${info.port}`);
    console.log(`Frontend URL: ${FRONTEND_URL}`);
  }
);

export default app;

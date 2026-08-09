import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db, schema } from "../db/index.js";
import { eq } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const TOKEN_EXPIRY = "30d";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  companyName: z.string().min(1),
  companySize: z.string().min(1),
  industry: z.string().min(1),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const authRoutes = new Hono();

// POST /api/auth/register
authRoutes.post("/register", zValidator("json", registerSchema), async (c) => {
  try {
    const body = c.req.valid("json");

    // Check if user already exists
    const existing = db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, body.email))
      .get();

    if (existing) {
      return c.json({ success: false, error: "Email already registered" }, 409);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(body.password, 10);

    // Create user
    const now = new Date().toISOString();
    const result = db
      .insert(schema.users)
      .values({
        email: body.email,
        passwordHash,
        name: body.name,
        companyName: body.companyName,
        companySize: body.companySize,
        industry: body.industry,
        plan: "free",
        createdAt: now,
      })
      .returning()
      .get();

    // Generate JWT
    const token = jwt.sign({ userId: result.id, email: result.email }, JWT_SECRET, {
      expiresIn: TOKEN_EXPIRY,
    });

    return c.json(
      {
        success: true,
        data: {
          token,
          user: {
            id: result.id,
            email: result.email,
            name: result.name,
            companyName: result.companyName,
            plan: result.plan,
            createdAt: result.createdAt,
          },
        },
      },
      201
    );
  } catch (err) {
    console.error("Register error:", err);
    return c.json({ success: false, error: "Registration failed" }, 500);
  }
});

// POST /api/auth/login
authRoutes.post("/login", zValidator("json", loginSchema), async (c) => {
  try {
    const body = c.req.valid("json");

    // Find user
    const user = db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, body.email))
      .get();

    if (!user) {
      return c.json({ success: false, error: "Invalid email or password" }, 401);
    }

    // Verify password
    const valid = await bcrypt.compare(body.password, user.passwordHash);
    if (!valid) {
      return c.json({ success: false, error: "Invalid email or password" }, 401);
    }

    // Generate JWT
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: TOKEN_EXPIRY,
    });

    return c.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          companyName: user.companyName,
          plan: user.plan,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return c.json({ success: false, error: "Login failed" }, 500);
  }
});

// GET /api/auth/me
authRoutes.get("/me", authMiddleware, async (c) => {
  try {
    const userId = c.get("userId") as number;

    const user = db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .get();

    if (!user) {
      return c.json({ success: false, error: "User not found" }, 404);
    }

    return c.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          companyName: user.companyName,
          plan: user.plan,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (err) {
    console.error("Me error:", err);
    return c.json({ success: false, error: "Failed to fetch user" }, 500);
  }
});

export default authRoutes;

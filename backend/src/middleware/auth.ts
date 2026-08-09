import type { Context, Next } from "hono";
import jwt from "jsonwebtoken";
import { db, schema } from "../db/index.js";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

export interface JwtPayload {
  userId: number;
  email: string;
}

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ success: false, error: "Missing authorization header" }, 401);
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    // Verify user still exists
    const user = db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, decoded.userId))
      .get();

    if (!user) {
      return c.json({ success: false, error: "User not found" }, 401);
    }

    c.set("userId", decoded.userId);
    c.set("userPlan", user.plan);

    await next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return c.json({ success: false, error: "Token expired" }, 401);
    }
    return c.json({ success: false, error: "Invalid token" }, 401);
  }
}

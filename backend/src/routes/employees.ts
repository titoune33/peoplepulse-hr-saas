import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db, schema } from "../db/index.js";
import { eq, and, like, sql } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth.js";

const createEmployeeSchema = z.object({
  externalId: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  department: z.string().min(1),
  position: z.string().min(1),
  status: z.enum(["active", "terminated", "on_leave"]).optional().default("active"),
  hireDate: z.string().min(1),
  terminationDate: z.string().optional().nullable(),
  salary: z.number().positive(),
});

const updateEmployeeSchema = createEmployeeSchema.partial();

export const employeeRoutes = new Hono();

// All employee routes require authentication
employeeRoutes.use("*", authMiddleware);

// GET /api/employees
employeeRoutes.get("/", async (c) => {
  try {
    const userId = c.get("userId") as number;
    const page = parseInt(c.req.query("page") || "1", 10);
    const limit = parseInt(c.req.query("limit") || "50", 10);
    const department = c.req.query("department");
    const status = c.req.query("status");
    const search = c.req.query("search");

    let query = db
      .select()
      .from(schema.employees)
      .where(eq(schema.employees.userId, userId));

    // Apply filters
    if (department) {
      query = query.where(eq(schema.employees.department, department));
    }
    if (status) {
      query = query.where(eq(schema.employees.status, status));
    }
    if (search) {
      query = query.where(
        sql`(${schema.employees.firstName} || ' ' || ${schema.employees.lastName}) LIKE ${`%${search}%`}`
      );
    }

    // Get total count
    const allResults: unknown[] = query.all();
    const total = allResults.length;

    // Apply pagination
    const offset = (page - 1) * limit;
    const employees = allResults.slice(offset, offset + limit);

    // Get attrition risks for these employees
    const employeeIds = employees.map((e: any) => e.id);
    let risks: any[] = [];
    if (employeeIds.length > 0) {
      risks = db
        .select()
        .from(schema.attritionRisks)
        .where(sql`${schema.attritionRisks.employeeId} IN (${employeeIds.join(",")})`)
        .all();
    }

    const riskMap = new Map(risks.map((r: any) => [r.employeeId, r]));

    // Format response
    const formatted = employees.map((emp: any) => {
      const risk = riskMap.get(emp.id);
      return {
        id: emp.id,
        name: `${emp.firstName} ${emp.lastName}`,
        email: emp.email,
        department: emp.department,
        position: emp.position,
        status: emp.status,
        hireDate: emp.hireDate,
        salary: emp.salary,
        attritionRisk: risk
          ? {
              score: risk.riskScore,
              factors: JSON.parse(risk.factors),
            }
          : null,
      };
    });

    return c.json({
      success: true,
      data: {
        employees: formatted,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("List employees error:", err);
    return c.json({ success: false, error: "Failed to fetch employees" }, 500);
  }
});

// GET /api/employees/:id
employeeRoutes.get("/:id", async (c) => {
  try {
    const userId = c.get("userId") as number;
    const employeeId = parseInt(c.req.param("id"), 10);

    const employee = db
      .select()
      .from(schema.employees)
      .where(and(eq(schema.employees.id, employeeId), eq(schema.employees.userId, userId)))
      .get();

    if (!employee) {
      return c.json({ success: false, error: "Employee not found" }, 404);
    }

    // Get attrition risk
    const risk = db
      .select()
      .from(schema.attritionRisks)
      .where(eq(schema.attritionRisks.employeeId, employeeId))
      .get();

    return c.json({
      success: true,
      data: {
        employee: {
          id: employee.id,
          name: `${employee.firstName} ${employee.lastName}`,
          email: employee.email,
          department: employee.department,
          position: employee.position,
          status: employee.status,
          hireDate: employee.hireDate,
          terminationDate: employee.terminationDate,
          salary: employee.salary,
          attritionRisk: risk
            ? {
                score: risk.riskScore,
                factors: JSON.parse(risk.factors),
              }
            : null,
        },
      },
    });
  } catch (err) {
    console.error("Get employee error:", err);
    return c.json({ success: false, error: "Failed to fetch employee" }, 500);
  }
});

// POST /api/employees
employeeRoutes.post("/", zValidator("json", createEmployeeSchema), async (c) => {
  try {
    const userId = c.get("userId") as number;
    const body = c.req.valid("json");
    const now = new Date().toISOString();

    const result = db
      .insert(schema.employees)
      .values({
        userId,
        externalId: body.externalId,
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        department: body.department,
        position: body.position,
        status: body.status || "active",
        hireDate: body.hireDate,
        terminationDate: body.terminationDate || null,
        salary: body.salary,
        createdAt: now,
      })
      .returning()
      .get();

    return c.json(
      {
        success: true,
        data: {
          id: result.id,
          name: `${result.firstName} ${result.lastName}`,
          email: result.email,
          department: result.department,
          position: result.position,
          status: result.status,
          hireDate: result.hireDate,
          salary: result.salary,
        },
      },
      201
    );
  } catch (err) {
    console.error("Create employee error:", err);
    return c.json({ success: false, error: "Failed to create employee" }, 500);
  }
});

// PUT /api/employees/:id
employeeRoutes.put("/:id", zValidator("json", updateEmployeeSchema), async (c) => {
  try {
    const userId = c.get("userId") as number;
    const employeeId = parseInt(c.req.param("id"), 10);
    const body = c.req.valid("json");

    // Check ownership
    const existing = db
      .select()
      .from(schema.employees)
      .where(and(eq(schema.employees.id, employeeId), eq(schema.employees.userId, userId)))
      .get();

    if (!existing) {
      return c.json({ success: false, error: "Employee not found" }, 404);
    }

    const result = db
      .update(schema.employees)
      .set(body)
      .where(eq(schema.employees.id, employeeId))
      .returning()
      .get();

    return c.json({
      success: true,
      data: {
        id: result.id,
        name: `${result.firstName} ${result.lastName}`,
        email: result.email,
        department: result.department,
        position: result.position,
        status: result.status,
        hireDate: result.hireDate,
        salary: result.salary,
      },
    });
  } catch (err) {
    console.error("Update employee error:", err);
    return c.json({ success: false, error: "Failed to update employee" }, 500);
  }
});

// DELETE /api/employees/:id
employeeRoutes.delete("/:id", async (c) => {
  try {
    const userId = c.get("userId") as number;
    const employeeId = parseInt(c.req.param("id"), 10);

    const existing = db
      .select()
      .from(schema.employees)
      .where(and(eq(schema.employees.id, employeeId), eq(schema.employees.userId, userId)))
      .get();

    if (!existing) {
      return c.json({ success: false, error: "Employee not found" }, 404);
    }

    db.delete(schema.employees).where(eq(schema.employees.id, employeeId)).run();

    return c.json({ success: true, data: { deleted: true } });
  } catch (err) {
    console.error("Delete employee error:", err);
    return c.json({ success: false, error: "Failed to delete employee" }, 500);
  }
});

export default employeeRoutes;

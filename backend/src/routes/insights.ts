import { Hono } from "hono";
import { db, schema } from "../db/index.js";
import { eq, sql } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth.js";
import { generateInsights, generateMockInsights } from "../lib/huggingface.js";

export const insightRoutes = new Hono();

insightRoutes.use("*", authMiddleware);

insightRoutes.get("/", async (c) => {
  try {
    const userId = c.get("userId") as number;
    const userPlan = c.get("userPlan") as string;
    const insightType = c.req.query("type") || "general";

    const employees = db
      .select()
      .from(schema.employees)
      .where(eq(schema.employees.userId, userId))
      .all();

    const totalEmployees = employees.length;
    const activeEmployees = employees.filter((e) => e.status === "active");

    const departmentMap = new Map<string, number>();
    for (const emp of activeEmployees) {
      departmentMap.set(emp.department, (departmentMap.get(emp.department) || 0) + 1);
    }
    const departments = Array.from(departmentMap.entries()).map(
      ([name, count]) => ({ name, count })
    );

    const now = new Date();
    const avgSalary =
      activeEmployees.length > 0
        ? activeEmployees.reduce((sum, e) => sum + e.salary, 0) / activeEmployees.length
        : 0;

    const avgTenure =
      activeEmployees.length > 0
        ? activeEmployees.reduce((sum, e) => {
            const hireDate = new Date(e.hireDate);
            return sum + (now.getTime() - hireDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
          }, 0) / activeEmployees.length
        : 0;

    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const recentHires = employees
      .filter((e) => new Date(e.hireDate) >= ninetyDaysAgo)
      .map((e) => ({
        name: `${e.firstName} ${e.lastName}`,
        department: e.department,
      }));

    const employeeSummary = {
      totalEmployees,
      departments,
      avgSalary,
      avgTenure,
      topPerformers: [] as string[],
      recentHires,
    };

    let insightData: unknown;
    let insightText: string;

    if (userPlan === "pro") {
      try {
        insightText = await generateInsights(employeeSummary, insightType);
      } catch (hfError) {
        console.error("Hugging Face API error, falling back to mock:", hfError);
        insightText = generateMockInsights(employeeSummary, insightType);
      }
    } else {
      insightText = generateMockInsights(employeeSummary, insightType);
    }

    // Parse le JSON stringifié en objet pour le frontend
    try {
      insightData = JSON.parse(insightText);
    } catch {
      insightData = insightText; // fallback au texte brut
    }

    return c.json({
      success: true,
      data: {
        insights: insightData,
        type: insightType,
        generatedAt: new Date().toISOString(),
        plan: userPlan,
      },
    });
  } catch (err) {
    console.error("Insights error:", err);
    return c.json({ success: false, error: "Failed to generate insights" }, 500);
  }
});

export default insightRoutes;

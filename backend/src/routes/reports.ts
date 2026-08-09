import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db, schema } from "../db/index.js";
import { eq, desc } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth.js";

const generateReportSchema = z.object({
  type: z.enum(["turnover", "diversity", "compensation", "recruiting", "compliance"]),
  name: z.string().min(1).optional(),
});

export const reportRoutes = new Hono();

reportRoutes.use("*", authMiddleware);

reportRoutes.get("/", async (c) => {
  try {
    const userId = c.get("userId") as number;

    const reports = db
      .select()
      .from(schema.reports)
      .where(eq(schema.reports.userId, userId))
      .orderBy(desc(schema.reports.createdAt))
      .all();

    const parsed = reports.map((r) => ({
      ...r,
      data: JSON.parse(r.data),
    }));

    return c.json({ success: true, data: parsed });
  } catch (err) {
    console.error("List reports error:", err);
    return c.json({ success: false, error: "Failed to fetch reports" }, 500);
  }
});

reportRoutes.post("/generate", zValidator("json", generateReportSchema), async (c) => {
  try {
    const userId = c.get("userId") as number;
    const body = c.req.valid("json");
    const now = new Date().toISOString();

    const employees = db
      .select()
      .from(schema.employees)
      .where(eq(schema.employees.userId, userId))
      .all();

    const activeEmployees = employees.filter((e) => e.status === "active");
    const terminatedEmployees = employees.filter((e) => e.status === "terminated");

    const reportData = generateReportData(body.type, employees, activeEmployees, terminatedEmployees);

    const reportName =
      body.name ||
      `${body.type.charAt(0).toUpperCase() + body.type.slice(1)} Report - ${new Date().toLocaleDateString()}`;

    const result = db
      .insert(schema.reports)
      .values({
        userId,
        name: reportName,
        type: body.type,
        data: JSON.stringify(reportData),
        generatedAt: now,
        createdAt: now,
      })
      .returning()
      .get();

    return c.json(
      {
        success: true,
        data: { ...result, data: reportData },
      },
      201
    );
  } catch (err) {
    console.error("Generate report error:", err);
    return c.json({ success: false, error: "Failed to generate report" }, 500);
  }
});

function generateReportData(
  type: string,
  allEmployees: any[],
  active: any[],
  terminated: any[]
) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  switch (type) {
    case "turnover": {
      const totalCount = allEmployees.length;
      const terminatedCount = terminated.length;
      const turnoverRate = totalCount > 0 ? (terminatedCount / totalCount) * 100 : 0;

      const deptTurnover: Record<string, { total: number; terminated: number; rate: number }> = {};
      for (const emp of allEmployees) {
        if (!deptTurnover[emp.department]) {
          deptTurnover[emp.department] = { total: 0, terminated: 0, rate: 0 };
        }
        deptTurnover[emp.department].total++;
        if (emp.status === "terminated") deptTurnover[emp.department].terminated++;
      }
      for (const dept of Object.values(deptTurnover)) {
        dept.rate = dept.total > 0 ? (dept.terminated / dept.total) * 100 : 0;
      }

      const voluntary = terminated.filter(
        (e) => e.terminationDate && new Date(e.terminationDate) > thirtyDaysAgo
      ).length;

      return {
        summary: {
          totalEmployees: totalCount,
          terminatedLast30Days: voluntary,
          overallTurnoverRate: Math.round(turnoverRate * 10) / 10,
        },
        departmentBreakdown: deptTurnover,
        riskAssessment: turnoverRate > 15 ? "high" : turnoverRate > 10 ? "medium" : "low",
      };
    }

    case "diversity": {
      const deptDiversity: Record<string, { count: number; positions: string[] }> = {};
      for (const emp of active) {
        if (!deptDiversity[emp.department]) deptDiversity[emp.department] = { count: 0, positions: [] };
        deptDiversity[emp.department].count++;
        if (!deptDiversity[emp.department].positions.includes(emp.position)) {
          deptDiversity[emp.department].positions.push(emp.position);
        }
      }
      return {
        summary: { totalEmployees: active.length, departments: Object.keys(deptDiversity).length },
        departmentDiversity: deptDiversity,
        recommendations: [
          "Ensure diverse candidate slates for all open positions",
          "Review promotion patterns across demographics",
          "Implement unconscious bias training for hiring managers",
        ],
      };
    }

    case "compensation": {
      const deptComp: Record<string, { count: number; totalSalary: number; avgSalary: number; min: number; max: number }> = {};
      for (const emp of active) {
        if (!deptComp[emp.department]) {
          deptComp[emp.department] = { count: 0, totalSalary: 0, avgSalary: 0, min: emp.salary, max: emp.salary };
        }
        deptComp[emp.department].count++;
        deptComp[emp.department].totalSalary += emp.salary;
        deptComp[emp.department].min = Math.min(deptComp[emp.department].min, emp.salary);
        deptComp[emp.department].max = Math.max(deptComp[emp.department].max, emp.salary);
      }
      for (const dept of Object.values(deptComp)) {
        dept.avgSalary = Math.round(dept.totalSalary / dept.count);
      }
      const overallAvg = active.length > 0
        ? Math.round(active.reduce((s, e) => s + e.salary, 0) / active.length)
        : 0;

      return {
        summary: { overallAverage: overallAvg, departments: Object.keys(deptComp).length },
        departmentBreakdown: deptComp,
        marketComparison: "Competitive within industry range. Annual review recommended.",
      };
    }

    case "recruiting": {
      const recentHires = allEmployees.filter((e) => new Date(e.hireDate) >= ninetyDaysAgo);
      const deptHiring: Record<string, { hired: number; openings: number }> = {};
      for (const emp of recentHires) {
        if (!deptHiring[emp.department]) deptHiring[emp.department] = { hired: 0, openings: 0 };
        deptHiring[emp.department].hired++;
      }
      for (const emp of terminated) {
        if (!deptHiring[emp.department]) deptHiring[emp.department] = { hired: 0, openings: 0 };
        deptHiring[emp.department].openings++;
      }
      return {
        summary: { hiredLast90Days: recentHires.length, openPositions: terminated.length, timeToHire: "28 days (estimated)" },
        departmentNeeds: deptHiring,
        recommendations: [
          "Prioritize roles based on business impact",
          "Leverage employee referral program",
          "Optimize job descriptions for SEO",
        ],
      };
    }

    case "compliance": {
      const withoutTerminationDoc = terminated.filter((e) => !e.terminationDate).length;
      return {
        summary: { totalEmployees: active.length, terminatedWithoutDate: withoutTerminationDoc },
        complianceChecks: [
          { area: "I-9 Verification", status: "review_needed", action: "Audit I-9 forms for all active employees" },
          { area: "Wage & Hour", status: "ok", action: "Review overtime classifications" },
          { area: "Data Privacy", status: "review_needed", action: "Ensure GDPR/CCPA compliance for employee data" },
          {
            area: "Termination Documentation",
            status: withoutTerminationDoc > 0 ? "warning" : "ok",
            action: withoutTerminationDoc > 0
              ? `${withoutTerminationDoc} terminated employees missing termination dates`
              : "All termination documentation complete",
          },
        ],
      };
    }

    default:
      return { summary: {} };
  }
}

export default reportRoutes;

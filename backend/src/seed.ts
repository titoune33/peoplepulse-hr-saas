import "dotenv/config";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { eq } from "drizzle-orm";
import * as schema from "./db/schema.js";

const DATABASE_URL = process.env.DATABASE_URL || "./data/peoplepulse.db";

console.log("Seeding database...");

// Initialize database connection
const sqlite = new Database(DATABASE_URL);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");
const db = drizzle(sqlite, { schema });

// Create tables
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    company_name TEXT NOT NULL,
    company_size TEXT NOT NULL,
    industry TEXT NOT NULL,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    plan TEXT NOT NULL DEFAULT 'free',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    external_id TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    department TEXT NOT NULL,
    position TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    hire_date TEXT NOT NULL,
    termination_date TEXT,
    salary REAL NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS attrition_risks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    risk_score REAL NOT NULL,
    factors TEXT NOT NULL,
    last_evaluated TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    data TEXT NOT NULL,
    generated_at TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
`);

// Clear existing data
sqlite.exec(`
  DELETE FROM sessions;
  DELETE FROM attrition_risks;
  DELETE FROM reports;
  DELETE FROM employees;
  DELETE FROM users;
`);

async function seed() {
  const now = new Date().toISOString();

  // Create demo user
  const passwordHash = await bcrypt.hash("password123", 12);

  const userResult = db
    .insert(schema.users)
    .values({
      email: "demo@peoplepulse.com",
      passwordHash,
      name: "Demo User",
      companyName: "Acme Corp",
      companySize: "50-200",
      industry: "Technology",
      plan: "pro",
      createdAt: now,
    })
    .returning()
    .get();

  const userId = userResult.id;
  console.log(`Created demo user (ID: ${userId}): demo@peoplepulse.com / password123`);

  // Employee data
  const departments = [
    "Engineering",
    "Product",
    "Design",
    "Marketing",
    "Sales",
    "HR",
    "Finance",
    "Operations",
    "Customer Success",
    "Legal",
  ];

  const positionsByDept: Record<string, string[]> = {
    Engineering: [
      "Software Engineer",
      "Senior Software Engineer",
      "Staff Engineer",
      "Engineering Manager",
      "DevOps Engineer",
      "QA Engineer",
      "Principal Engineer",
      "Frontend Developer",
      "Backend Developer",
      "Full Stack Developer",
    ],
    Product: [
      "Product Manager",
      "Senior Product Manager",
      "Director of Product",
      "Product Designer",
      "Technical Product Manager",
      "Associate Product Manager",
    ],
    Design: [
      "UX Designer",
      "UI Designer",
      "Senior Designer",
      "Design Lead",
      "Graphic Designer",
      "Design System Lead",
    ],
    Marketing: [
      "Marketing Manager",
      "Content Strategist",
      "SEO Specialist",
      "Growth Marketer",
      "Brand Manager",
      "Demand Generation Manager",
      "Social Media Manager",
    ],
    Sales: [
      "Account Executive",
      "Sales Development Rep",
      "Sales Manager",
      "Enterprise AE",
      "Solutions Engineer",
      "Sales Operations",
      "BDR",
    ],
    HR: [
      "HR Manager",
      "Recruiter",
      "HR Coordinator",
      "People Operations",
      "Talent Acquisition",
      "HR Business Partner",
    ],
    Finance: [
      "Financial Analyst",
      "Controller",
      "Accountant",
      "FP&A Manager",
      "Payroll Specialist",
      "Finance Director",
    ],
    Operations: [
      "Operations Manager",
      "Business Analyst",
      "Project Manager",
      "Program Manager",
      "Chief of Staff",
      "Operations Coordinator",
    ],
    "Customer Success": [
      "Customer Success Manager",
      "Support Engineer",
      "Onboarding Specialist",
      "Account Manager",
      "Support Lead",
      "Technical Support",
    ],
    Legal: [
      "Legal Counsel",
      "Compliance Officer",
      "Contract Manager",
      "Paralegal",
      "IP Counsel",
      "Privacy Manager",
    ],
  };

  const firstNames = [
    "James", "Maria", "Chen", "Sarah", "Michael", "Jessica", "David", "Emily",
    "Daniel", "Sophia", "Alex", "Olivia", "Ryan", "Isabella", "Ethan", "Mia",
    "Noah", "Charlotte", "Liam", "Amelia", "Lucas", "Harper", "Mason", "Evelyn",
    "Logan", "Abigail", "Aiden", "Ella", "Jackson", "Scarlett", "Benjamin", "Grace",
    "Henry", "Chloe", "Sebastian", "Victoria", "Jack", "Riley", "Owen", "Lily",
    "Gabriel", "Zoey", "Matthew", "Penelope", "Leo", "Layla", "Julian", "Nora",
    "Aaron", "Camila", "Kevin", "Hannah", "Wei", "Priya", "Yuki", "Fatima",
    "Omar", "Sofia", "Andre", "Luna", "Diego", "Aria", "Carlos", "Mila",
    "Raj", "Zara", "Ahmed", "Ivy", "Miguel", "Aurora", "Hiroshi", "Elena",
  ];

  const lastNames = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
    "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
    "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson",
    "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker",
    "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill",
    "Flores", "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell",
    "Mitchell", "Carter", "Roberts", "Chen", "Patel", "Kim", "Tanaka", "Kumar",
    "Singh", "Ali", "Santos", "Costa", "Ferrari", "Muller", "Dubois", "Andersen",
  ];

  const statuses: Array<"active" | "terminated" | "on_leave"> = [
    "active",
    "active",
    "active",
    "active",
    "active",
    "active",
    "active",
    "active",
    "active",
    "terminated",
  ]; // ~10% terminated

  const employeeRecords: Array<{
    externalId: string;
    firstName: string;
    lastName: string;
    email: string;
    department: string;
    position: string;
    status: "active" | "terminated" | "on_leave";
    hireDate: string;
    terminationDate: string | null;
    salary: number;
  }> = [];

  const usedEmails = new Set<string>();

  // Assign employees to departments with a realistic distribution
  const deptDistribution: Record<string, number> = {
    Engineering: 40,
    Product: 15,
    Design: 10,
    Marketing: 14,
    Sales: 22,
    HR: 8,
    Finance: 9,
    Operations: 12,
    "Customer Success": 12,
    Legal: 5,
  };

  let employeeId = 1001;

  for (const [dept, count] of Object.entries(deptDistribution)) {
    const positions = positionsByDept[dept];

    for (let i = 0; i < count; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@acmecorp.com`;
      const position = positions[i % positions.length];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      // Generate hire date (1-5 years ago)
      const yearsAgo = Math.random() * 4 + 1;
      const hireDate = new Date(
        Date.now() - yearsAgo * 365.25 * 24 * 60 * 60 * 1000
      );
      // Randomize the day
      hireDate.setDate(hireDate.getDate() + Math.floor(Math.random() * 30));

      let terminationDate: string | null = null;
      if (status === "terminated") {
        const termDate = new Date(
          hireDate.getTime() +
            (Math.random() * 2 + 0.5) * 365.25 * 24 * 60 * 60 * 1000
        );
        terminationDate = termDate.toISOString().split("T")[0];
      }

      // Salary based on department and a bit of randomness
      const baseSalaries: Record<string, number> = {
        Engineering: 120000,
        Product: 115000,
        Design: 100000,
        Marketing: 90000,
        Sales: 95000,
        HR: 80000,
        Finance: 95000,
        Operations: 85000,
        "Customer Success": 80000,
        Legal: 130000,
      };

      const baseSalary = baseSalaries[dept] || 85000;
      const salaryVariation = (Math.random() - 0.3) * 40000; // +- variation
      let salary = Math.round(baseSalary + salaryVariation);
      salary = Math.max(45000, Math.min(200000, salary));

      // Avoid duplicate emails
      let uniqueEmail = email;
      let counter = 1;
      while (usedEmails.has(uniqueEmail)) {
        uniqueEmail = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${counter}@acmecorp.com`;
        counter++;
      }
      usedEmails.add(uniqueEmail);

      employeeRecords.push({
        externalId: `EMP-${employeeId++}`,
        firstName,
        lastName,
        email: uniqueEmail,
        department: dept,
        position,
        status,
        hireDate: hireDate.toISOString().split("T")[0],
        terminationDate,
        salary,
      });
    }
  }

  // Insert all employees
  const insertStmt = sqlite.prepare(`
    INSERT INTO employees (user_id, external_id, first_name, last_name, email, department, position, status, hire_date, termination_date, salary, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = sqlite.transaction(
    (records: typeof employeeRecords) => {
      for (const emp of records) {
        insertStmt.run(
          userId,
          emp.externalId,
          emp.firstName,
          emp.lastName,
          emp.email,
          emp.department,
          emp.position,
          emp.status,
          emp.hireDate,
          emp.terminationDate,
          emp.salary,
          now
        );
      }
    }
  );

  insertMany(employeeRecords);
  console.log(`Inserted ${employeeRecords.length} employees`);

  // Create some attrition risk records
  const allEmployees = db
    .select()
    .from(schema.employees)
    .where(eq(schema.employees.userId, userId))
    .all();

  const highRiskEmployees = allEmployees
    .filter((e) => e.status === "active")
    .slice(0, 12);

  for (const emp of highRiskEmployees) {
    const riskScore = Math.round((Math.random() * 0.6 + 0.2) * 100) / 100;
    const factors = [
      "Low engagement score",
      "No promotion in 2+ years",
      "Below market compensation",
      "Long commute",
      "Limited growth opportunities",
    ];
    const selectedFactors = factors
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 3) + 1);

    db.insert(schema.attritionRisks)
      .values({
        employeeId: emp.id,
        riskScore,
        factors: JSON.stringify(selectedFactors),
        lastEvaluated: now,
        createdAt: now,
      })
      .run();
  }
  console.log(`Created ${highRiskEmployees.length} attrition risk records`);

  // Create some sample reports
  const reportTypes = ["turnover", "diversity", "compensation", "recruiting", "compliance"];
  for (const type of reportTypes) {
    const reportData = {
      generatedFor: "Acme Corp",
      period: "Q3 2024",
      timestamp: now,
    };

    db.insert(schema.reports)
      .values({
        userId,
        name: `${type.charAt(0).toUpperCase() + type.slice(1)} Report - Q3 2024`,
        type: type as any,
        data: JSON.stringify(reportData),
        generatedAt: now,
        createdAt: now,
      })
      .run();
  }
  console.log(`Created ${reportTypes.length} sample reports`);

  console.log("\n--- Seed Complete ---");
  console.log(`Demo login: demo@peoplepulse.com / password123`);
  console.log(`Total employees: ${employeeRecords.length}`);
  console.log(`Active: ${employeeRecords.filter((e) => e.status === "active").length}`);
  console.log(
    `Terminated: ${employeeRecords.filter((e) => e.status === "terminated").length}`
  );
  console.log(`On Leave: ${employeeRecords.filter((e) => e.status === "on_leave").length}`);
}

seed()
  .then(() => {
    sqlite.close();
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seed failed:", err);
    sqlite.close();
    process.exit(1);
  });

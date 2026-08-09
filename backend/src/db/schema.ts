import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  companyName: text("company_name").notNull(),
  companySize: text("company_size").notNull(),
  industry: text("industry").notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  plan: text("plan", { enum: ["free", "pro"] }).notNull().default("free"),
  createdAt: text("created_at").notNull(),
});

export const employees = sqliteTable("employees", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  externalId: text("external_id").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  department: text("department").notNull(),
  position: text("position").notNull(),
  status: text("status", { enum: ["active", "terminated", "on_leave"] }).notNull().default("active"),
  hireDate: text("hire_date").notNull(),
  terminationDate: text("termination_date"),
  salary: real("salary").notNull(),
  createdAt: text("created_at").notNull(),
});

export const attritionRisks = sqliteTable("attrition_risks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  employeeId: integer("employee_id").notNull().references(() => employees.id, { onDelete: "cascade" }),
  riskScore: real("risk_score").notNull(),
  factors: text("factors").notNull(),
  lastEvaluated: text("last_evaluated").notNull(),
  createdAt: text("created_at").notNull(),
});

export const reports = sqliteTable("reports", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type", {
    enum: ["turnover", "diversity", "compensation", "recruiting", "compliance"],
  }).notNull(),
  data: text("data").notNull(),
  generatedAt: text("generated_at").notNull(),
  createdAt: text("created_at").notNull(),
});

export const sessions = sqliteTable("sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").notNull(),
});

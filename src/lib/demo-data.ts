// Demo data for PeoplePulse MVP — simulates a connected HRIS

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  status: "active" | "on_leave" | "terminated";
  hireDate: string;
  salary: number;
  attritionRisk?: { score: number; factors: string[] };
}

export interface DepartmentStat {
  name: string;
  headcount: number;
  turnoverRate: number;
  avgTenure: number; // months
  avgSalary: number;
}

export interface MonthlyTurnover {
  month: string;
  voluntary: number;
  involuntary: number;
}

export interface HiringFunnel {
  stage: string;
  count: number;
}

export interface HRISConnection {
  provider: string;
  status: "connected" | "error" | "disconnected";
  lastSync: string;
  employees: number;
}

const departments = [
  { name: "Engineering", positions: ["Software Engineer", "Senior Engineer", "Engineering Manager", "Staff Engineer", "VP Engineering"] },
  { name: "Sales", positions: ["SDR", "Account Executive", "Sales Manager", "VP Sales"] },
  { name: "Marketing", positions: ["Content Manager", "Growth Marketer", "Marketing Lead", "CMO"] },
  { name: "Product", positions: ["Product Manager", "Senior PM", "Director of Product"] },
  { name: "People", positions: ["HR Generalist", "HR Manager", "VP People"] },
  { name: "Finance", positions: ["Accountant", "Financial Analyst", "CFO"] },
  { name: "Design", positions: ["Product Designer", "Senior Designer", "Design Director"] },
];

const firstNames = ["Alice", "Bob", "Charlie", "Diana", "Eve", "Frank", "Grace", "Henry", "Iris", "Jack", "Kate", "Leo", "Maria", "Noah", "Olivia", "Paul", "Quinn", "Rachel", "Sam", "Tina", "Uma", "Victor", "Wendy", "Xavier", "Yara", "Zack", "Aaron", "Bella", "Carlos", "Daphne", "Ethan", "Fiona", "George", "Hannah", "Ian", "Julia", "Kevin", "Luna", "Mason", "Nora", "Oscar", "Penny"];

const lastNames = ["Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Anderson", "Taylor", "Thomas", "Moore", "Jackson", "Martin", "Lee", "Perez", "White", "Harris", "Clark"];

const riskFactors = [
  "No promotion in 2+ years",
  "Below market compensation",
  "Low engagement score",
  "Recent manager change",
  "Long commute",
  "Limited growth opportunities",
  "Poor work-life balance",
  "Toxic team dynamics",
];

function seedRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rng = seedRandom(42);

export function getEmployees(): Employee[] {
  const employees: Employee[] = [];
  for (let i = 0; i < 147; i++) {
    const dept = departments[Math.floor(rng() * departments.length)];
    const firstName = firstNames[Math.floor(rng() * firstNames.length)];
    const lastName = lastNames[Math.floor(rng() * lastNames.length)];
    const hireMonthsAgo = Math.floor(rng() * 60) + 1;
    const hireDate = new Date(Date.now() - hireMonthsAgo * 30 * 24 * 60 * 60 * 1000);
    const statusRand = rng();
    const status: Employee["status"] = statusRand > 0.85 ? "terminated" : statusRand > 0.78 ? "on_leave" : "active";

    const emp: Employee = {
      id: `EMP-${String(i + 1).padStart(4, "0")}`,
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@company.com`,
      department: dept.name,
      position: dept.positions[Math.floor(rng() * dept.positions.length)],
      status,
      hireDate: hireDate.toISOString().split("T")[0],
      salary: Math.floor(45000 + rng() * 155000),
    };

    if (status === "active" && rng() > 0.65) {
      const numFactors = 1 + Math.floor(rng() * 3);
      const factors: string[] = [];
      for (let j = 0; j < numFactors; j++) {
        const f = riskFactors[Math.floor(rng() * riskFactors.length)];
        if (!factors.includes(f)) factors.push(f);
      }
      emp.attritionRisk = {
        score: Math.floor(10 + rng() * 80),
        factors,
      };
    }

    employees.push(emp);
  }
  return employees;
}

export function getDepartmentStats(): DepartmentStat[] {
  const employees = getEmployees();
  const deptMap = new Map<string, Employee[]>();

  for (const emp of employees) {
    const list = deptMap.get(emp.department) || [];
    list.push(emp);
    deptMap.set(emp.department, list);
  }

  return Array.from(deptMap.entries()).map(([name, emps]) => {
    const active = emps.filter((e) => e.status === "active");
    const terminated = emps.filter((e) => e.status === "terminated");
    const avgTenure = active.reduce((sum, e) => {
      const months = (Date.now() - new Date(e.hireDate).getTime()) / (30 * 24 * 60 * 60 * 1000);
      return sum + months;
    }, 0) / (active.length || 1);

    return {
      name,
      headcount: active.length,
      turnoverRate: Math.round((terminated.length / emps.length) * 1000) / 10,
      avgTenure: Math.round(avgTenure),
      avgSalary: Math.round(emps.reduce((s, e) => s + e.salary, 0) / emps.length),
    };
  });
}

export function getMonthlyTurnover(): MonthlyTurnover[] {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonth = new Date().getMonth();
  const data: MonthlyTurnover[] = [];
  for (let i = 11; i >= 0; i--) {
    const monthIdx = (currentMonth - i + 12) % 12;
    data.push({
      month: months[monthIdx],
      voluntary: Math.floor(rng() * 5) + 1,
      involuntary: Math.floor(rng() * 3),
    });
  }
  return data;
}

export function getHiringFunnel(): HiringFunnel[] {
  return [
    { stage: "Applications", count: 342 },
    { stage: "Screened", count: 180 },
    { stage: "Interview", count: 89 },
    { stage: "Offer", count: 24 },
    { stage: "Hired", count: 12 },
  ];
}

export function getHRISConnections(): HRISConnection[] {
  return [
    { provider: "BambooHR", status: "connected", lastSync: "2 hours ago", employees: 147 },
    { provider: "Paylocity", status: "connected", lastSync: "1 day ago", employees: 147 },
    { provider: "Workday", status: "connected", lastSync: "5 hours ago", employees: 89 },
  ];
}

export function getAtRiskEmployees(): Employee[] {
  return getEmployees()
    .filter((e) => e.attritionRisk && e.attritionRisk.score > 45)
    .sort((a, b) => (b.attritionRisk?.score || 0) - (a.attritionRisk?.score || 0))
    .slice(0, 8);
}

export function getKeyMetrics() {
  const employees = getEmployees();
  const active = employees.filter((e) => e.status === "active").length;
  const terminated = employees.filter((e) => e.status === "terminated").length;
  const onLeave = employees.filter((e) => e.status === "on_leave").length;
  const total = employees.length;
  const atRisk = employees.filter((e) => e.attritionRisk && e.attritionRisk.score > 45).length;

  const turnoverRate = Math.round((terminated / total) * 1000) / 10;
  const avgTenureMonths = active > 0
    ? Math.round(
        employees
          .filter((e) => e.status === "active")
          .reduce((sum, e) => sum + (Date.now() - new Date(e.hireDate).getTime()) / (30 * 24 * 60 * 60 * 1000), 0) / active
      )
    : 0;

  return {
    totalEmployees: total,
    activeEmployees: active,
    turnoverRate,
    avgTenureMonths,
    atRiskCount: atRisk,
    onLeave,
    openPositions: 8,
    timeToHire: 32, // days
    eNPS: 42,
  };
}

export function getAIInsights() {
  return [
    {
      id: "1",
      severity: "high" as const,
      title: "Engineering turnover risk spiking",
      description: "4 engineers in the backend team show attrition risk scores above 70. Below-market compensation and no recent promotions cited as top factors.",
      action: "Review compensation bands for backend engineers and schedule skip-level 1:1s this week.",
    },
    {
      id: "2",
      severity: "medium" as const,
      title: "Sales team onboarding bottleneck",
      description: "New hire ramp time increased 40% vs last quarter. Time-to-first-deal is now 67 days (was 48 days in Q1).",
      action: "Audit current onboarding program and consider assigning senior AEs as dedicated mentors.",
    },
    {
      id: "3",
      severity: "high" as const,
      title: "Compliance gap: missing SOC 2 training",
      description: "23 employees across Engineering and Product haven't completed mandatory SOC 2 training. Deadline was last week.",
      action: "Send automated reminders and escalate to department heads by Friday.",
    },
    {
      id: "4",
      severity: "low" as const,
      title: "Positive: eNPS improving",
      description: "Employee NPS rose from 34 to 42 this quarter. Remote flexibility and new learning budget cited as top drivers.",
      action: "Double down on the learning budget program — consider increasing from $1K to $2K per employee.",
    },
    {
      id: "5",
      severity: "medium" as const,
      title: "Gender pay gap detected in Product",
      description: "Analysis shows a 7% median pay gap between men and women in Product department for same-level roles.",
      action: "Conduct a pay equity audit and prepare adjustment recommendations for next comp review.",
    },
  ];
}

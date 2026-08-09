const HF_API_KEY = process.env.HF_API_KEY || "";
const HF_MODEL = process.env.HF_MODEL || "mistralai/Mistral-7B-Instruct-v0.3";

interface EmployeeSummary {
  totalEmployees: number;
  departments: { name: string; count: number }[];
  avgSalary: number;
  avgTenure: number;
  topPerformers: string[];
  recentHires: { name: string; department: string }[];
}

export async function generateInsights(
  summary: EmployeeSummary,
  type: string
): Promise<string> {
  if (!HF_API_KEY) {
    console.log("No Hugging Face API key configured, using mock insights");
    return generateMockInsights(summary, type);
  }

  const prompt = buildPrompt(summary, type);

  try {
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${HF_MODEL}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 512,
            temperature: 0.7,
            top_p: 0.9,
            return_full_text: false,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HF API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const generatedText =
      Array.isArray(data) && data[0]?.generated_text
        ? data[0].generated_text
        : typeof data === "string"
          ? data
          : JSON.stringify(data);

    return generatedText;
  } catch (error) {
    console.error("Hugging Face API call failed:", error);
    throw error;
  }
}

function buildPrompt(summary: EmployeeSummary, type: string): string {
  const deptInfo = summary.departments
    .map((d) => `  - ${d.name}: ${d.count} employees`)
    .join("\n");

  const recentHiresInfo = summary.recentHires.length > 0
    ? summary.recentHires.map((h) => `  - ${h.name} (${h.department})`).join("\n")
    : "  None in last 90 days";

  return `You are an HR analytics AI assistant analyzing employee data for a company.

Company Data:
- Total Employees: ${summary.totalEmployees}
- Average Salary: $${Math.round(summary.avgSalary).toLocaleString()}
- Average Tenure: ${Math.round(summary.avgTenure * 10) / 10} years
- Departments:
${deptInfo}
- Recent Hires (last 90 days):
${recentHiresInfo}

Analysis Type: ${type}

Based on this data, provide 3-5 actionable HR insights. For each insight, include:
1. A clear title
2. A detailed description of the finding
3. A severity level (high/medium/low)
4. A specific recommended action

Format as JSON array with fields: title, description, severity, action.`;
}

export function generateMockInsights(
  summary: EmployeeSummary,
  type: string
): string {
  const turnoverRate = summary.totalEmployees > 0
    ? Math.round((summary.recentHires.length / summary.totalEmployees) * 100)
    : 0;

  const insights: { title: string; description: string; severity: string; action: string }[] = [];

  if (type === "general" || type === "turnover") {
    insights.push({
      title: "Engineering attrition risk is elevated",
      description: `${summary.departments.find(d => d.name === "Engineering")?.count || 0} engineers show risk scores above 65. Factors include compensation below market and limited growth paths.`,
      severity: "high",
      action: "Schedule compensation review for Engineering team and create individual development plans (IDPs) for at-risk members.",
    });
    insights.push({
      title: "Q3 hiring surge may mask turnover issues",
      description: `${summary.recentHires.length} employees hired in the last 90 days across multiple departments. While headcount is growing, focus should remain on retention of existing talent.`,
      severity: "medium",
      action: "Launch stay interviews for employees with 1-2 years tenure to identify retention levers before they become flight risks.",
    });
  }

  if (type === "general" || type === "compensation") {
    insights.push({
      title: "Salary compression detected in mid-level roles",
      description: `Average salary of $${Math.round(summary.avgSalary).toLocaleString()} shows compression between new hires and existing employees with 3+ years tenure. This creates pay equity concerns.`,
      severity: "high",
      action: "Conduct a comprehensive pay equity audit across departments. Budget for market adjustments in the next compensation cycle.",
    });
  }

  if (type === "general" || type === "diversity") {
    insights.push({
      title: "Leadership pipeline lacks diversity",
      description: "Department head distribution is concentrated. Senior leadership tracks should be proactively diversified to reflect workforce composition.",
      severity: "medium",
      action: "Implement a sponsorship program pairing high-potential underrepresented employees with executive sponsors. Set measurable diversity targets for leadership pipeline.",
    });
  }

  if (type === "general" || type === "compliance") {
    insights.push({
      title: "Termination documentation gaps identified",
      description: "Several terminated employees lack proper exit documentation. This creates compliance risk for unemployment claims and legal challenges.",
      severity: "high",
      action: "Standardize the offboarding checklist to require completion of termination documentation before final payroll processing. Audit existing records.",
    });
  }

  // Always return at least 3 insights
  if (insights.length < 3) {
    insights.push({
      title: "Average tenure indicates stable workforce",
      description: `At ${Math.round(summary.avgTenure * 10) / 10} years average tenure, employee retention is healthy. Continue investing in engagement to maintain this advantage.`,
      severity: "low",
      action: "Document and scale successful retention practices. Survey long-tenured employees to understand what keeps them engaged.",
    });
    insights.push({
      title: "Onboarding effectiveness opportunity",
      description: `${summary.recentHires.length} recent hires present an opportunity to measure and improve time-to-productivity through structured onboarding.`,
      severity: "low",
      action: "Implement 30-60-90 day check-ins for all new hires. Track time-to-productivity metrics by department and hiring manager.",
    });
  }

  return JSON.stringify(insights.slice(0, 5));
}

"use client";

import { useState } from "react";
import * as XLSX from "xlsx-js-style";
import ExcelJS from "exceljs";

type AnalysisResult = {
   qualityScore: number;
  riskLevel: string;
  requirementIssues: {
    issue: string;
    recommendation: string;
  }[];
  summary: string;
  testScenarios: {
    id: string;
    scenario: string;
    type: string;
    priority: string;
  }[];
  negativeTests: {
    id: string;
    scenario: string;
    priority: string;
  }[];
  edgeCases: {
    id: string;
    scenario: string;
    priority: string;
  }[];
  securityTests: {
    id: string;
    scenario: string;
    priority: string;
  }[];
  testCases: {
  id: string;
  module: string;
  scenario: string;
  testData: string;
  preconditions: string;
  steps: string[];
  expectedResult: string;
  testType: string;
  priority: string;
  severity: string;
  executionType: "Automate" | "Manual" | "Both";
  automationPriority: "High" | "Medium" | "Low";
  automationReason: string;
}[];
  coverageGaps: {
    gap: string;
    recommendation: string;
  }[];
};

export default function Home() {
  const [requirement, setRequirement] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyzeRequirement = async () => {
    if (!requirement.trim()) {
      setError("Please enter a requirement first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requirement }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to analyze the requirement."
      );
    } finally {
      setLoading(false);
    }
  };

  const trySample = () => {
    setRequirement(
      "As a customer, I want to add products to my cart and proceed to checkout using a valid payment method."
    );
    setError("");
  };
  const exportTestCases = () => {
  if (!result?.testCases?.length) {
    return;
  }

  const exportData = result.testCases.map((test) => ({
    "TC ID": test.id,
    Module: test.module,
    Scenario: test.scenario,
    "Test Data": test.testData,
    Preconditions: test.preconditions,

    "Test Steps": test.steps
      .map((step, index) => {
        const cleanStep = step.trim().replace(/[.!?]+$/, "");
        return `${index + 1}. ${cleanStep}.`;
      })
      .join("\n"),

    "Expected Result": test.expectedResult,
    "Test Type": test.testType,
    Priority: test.priority,
    Severity: test.severity,
    "Execution Type": test.executionType,
    "Automation Priority": test.automationPriority,
    "Automation Reason": test.automationReason,
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Test Cases");

  const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1:M1");

  // Column widths
  worksheet["!cols"] = [
    { wch: 10 },
    { wch: 18 },
    { wch: 45 },
    { wch: 35 },
    { wch: 35 },
    { wch: 50 },
    { wch: 50 },
    { wch: 18 },
    { wch: 12 },
    { wch: 12 },
    { wch: 18 },
    { wch: 20 },
    { wch: 50 },
  ];

  // Dark border
  const darkBorder = {
    top: {
      style: "thin",
      color: { rgb: "404040" },
    },
    bottom: {
      style: "thin",
      color: { rgb: "404040" },
    },
    left: {
      style: "thin",
      color: { rgb: "404040" },
    },
    right: {
      style: "thin",
      color: { rgb: "404040" },
    },
  };

  // Style all cells
  for (let row = range.s.r; row <= range.e.r; row++) {
    for (let col = range.s.c; col <= range.e.c; col++) {
      const address = XLSX.utils.encode_cell({
        r: row,
        c: col,
      });

      const cell = worksheet[address];

      if (!cell) continue;

      // Header
      if (row === 0) {
        cell.s = {
          fill: {
            fgColor: {
              rgb: "1F4E78",
            },
          },
          font: {
            bold: true,
            color: {
              rgb: "FFFFFF",
            },
            sz: 11,
          },
          alignment: {
            horizontal: "center",
            vertical: "center",
            wrapText: true,
          },
          border: darkBorder,
        };
      }

      // Data cells
      else {
        cell.s = {
          font: {
            color: {
              rgb: "000000",
            },
            sz: 10,
          },
          alignment: {
            vertical: "top",
            wrapText: true,
          },
          border: darkBorder,
        };
      }
    }
  }

  // Header height
  worksheet["!rows"] = [
    {
      hpt: 32,
    },
  ];

  // Freeze header row
  worksheet["!views"] = [
  {
    state: "frozen",
    ySplit: 1,
    topLeftCell: "A2",
    activeCell: "A2",
  },
];
  // Filter
  worksheet["!autofilter"] = {
    ref: worksheet["!ref"] || "A1:M1",
  };

  XLSX.writeFile(workbook, "TestSense_AI_Test_Cases.xlsx");
};

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold">
              TestSense <span className="text-cyan-400">AI</span>
            </h1>

            <p className="text-sm text-slate-400">
              AI-Powered QA Test Design & Coverage Intelligence
            </p>
          </div>

          <div className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300">
            QA Assistant
          </div>
        </div>
      </header>

      {/* Main */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-cyan-400">
            AI Testing Assistant
          </p>

          <h2 className="max-w-3xl text-4xl font-bold leading-tight md:text-5xl">
            Turn requirements into a smarter{" "}
            <span className="text-cyan-400">QA strategy.</span>
          </h2>

          <p className="mt-5 max-w-2xl text-lg text-slate-400">
            Analyze requirements, generate test scenarios, discover edge cases,
            and identify missing test coverage using AI.
          </p>
        </div>

        {/* Analyzer */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
            <div className="mb-5">
              <h3 className="text-xl font-semibold">
                Requirement Analyzer
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Enter a user story or software requirement.
              </p>
            </div>

            <textarea
              value={requirement}
              onChange={(e) => setRequirement(e.target.value)}
              placeholder="Example: As a customer, I want to add products to my cart and proceed to checkout..."
              className="h-56 w-full resize-none rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
            />

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={analyzeRequirement}
                disabled={loading}
                className="rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Analyzing..." : "Analyze Requirement"}
              </button>

              <button
                onClick={trySample}
                className="rounded-xl border border-slate-700 px-6 py-3 font-medium text-slate-300 transition hover:bg-slate-800"
              >
                Try Sample
              </button>
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                ⚠️ {error}
              </div>
            )}
          </div>

          {/* Capabilities */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="text-xl font-semibold">AI Capabilities</h3>

            <div className="mt-6 space-y-4">
              <Capability
                icon="🧪"
                title="Test Case Generation"
                description="Create functional and negative test cases."
              />

              <Capability
                icon="⚠️"
                title="Edge Case Detection"
                description="Discover boundary and unusual scenarios."
              />

              <Capability
                icon="🔐"
                title="Security Scenarios"
                description="Suggest security-focused tests."
              />

              <Capability
                icon="🎯"
                title="Coverage Gaps"
                description="Identify missing requirements and tests."
              />

              <Capability
                icon="📋"
                title="QA Documentation"
                description="Create structured testing documentation."
              />
            </div>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="mt-10 space-y-6">
            {/* Summary */}
            <div className="rounded-2xl border border-cyan-500/30 bg-slate-900 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">AI Analysis Result</h3>

                <span className="rounded-full bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300">
                  AI Generated
                </span>
              </div>

              <p className="mt-4 text-slate-300">{result.summary}</p>
            </div>

            {/* Requirement Quality */}
<div className="grid gap-6 md:grid-cols-3">
  <div className="rounded-2xl border border-cyan-500/30 bg-slate-900 p-6">
    <p className="text-sm text-slate-400">Requirement Quality</p>

    <p className="mt-2 text-5xl font-bold text-cyan-400">
      {result.qualityScore}
      <span className="text-2xl">/100</span>
    </p>

    <p className="mt-2 text-sm text-slate-500">
      Based on clarity, completeness and testability
    </p>
  </div>

  <div className="rounded-2xl border border-yellow-500/30 bg-slate-900 p-6">
    <p className="text-sm text-slate-400">Risk Level</p>

    <p className="mt-3 text-3xl font-bold text-yellow-300">
      {result.riskLevel}
    </p>

    <p className="mt-2 text-sm text-slate-500">
      AI-estimated testing risk
    </p>
  </div>

  <div className="rounded-2xl border border-red-500/30 bg-slate-900 p-6">
    <p className="text-sm text-slate-400">Requirement Issues</p>

    <p className="mt-3 text-3xl font-bold text-red-300">
      {result.requirementIssues.length}
    </p>

    <p className="mt-2 text-sm text-slate-500">
      Issues requiring clarification
    </p>
  </div>
</div>

{/* Requirement Issues */}
<div className="rounded-2xl border border-orange-500/30 bg-slate-900 p-6">
  <h3 className="mb-5 text-xl font-bold text-orange-300">
    🔎 Requirement Quality Findings
  </h3>

  <div className="space-y-4">
    {result.requirementIssues.map((item, index) => (
      <div
        key={index}
        className="rounded-xl border border-slate-700 bg-slate-950 p-4"
      >
        <p className="font-medium text-white">
          {item.issue}
        </p>

        <p className="mt-2 text-sm text-slate-400">
          Recommendation: {item.recommendation}
        </p>
      </div>
    ))}
  </div>
</div>

{/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <Stat
                number={result.testScenarios.length}
                label="Test Scenarios"
              />

              <Stat
                number={result.negativeTests.length}
                label="Negative Tests"
              />

              <Stat
                number={result.edgeCases.length}
                label="Edge Cases"
              />

              <Stat
                number={result.securityTests.length}
                label="Security Tests"
              />

              <Stat
                number={result.coverageGaps.length}
                label="Coverage Gaps"
              />
            </div>

            {/* AI Generated Test Cases */}
<div className="rounded-2xl border border-cyan-500/30 bg-slate-900 p-6">
  <div className="mb-5 flex items-center justify-between">
    <div>
      <h3 className="text-xl font-bold text-cyan-300">
        📋 AI-Generated QA Test Cases
      </h3>
      <p className="mt-1 text-sm text-slate-400">
        Detailed executable test cases with AI-powered automation recommendations.
      </p>
    </div>

    <div className="flex items-center gap-3">
  <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-sm text-cyan-300">
    {result.testCases.length} Test Cases
  </span>

  <button
    onClick={exportTestCases}
    className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
  >
    📥 Export Test Cases
  </button>
</div>
  </div>

  <div className="overflow-x-auto">
    <table className="w-full min-w-[1200px] border-collapse text-sm">
      <thead>
        <tr className="border-b border-slate-700 text-left text-slate-400">
          <th className="p-3">TC ID</th>
          <th className="p-3">Module</th>
          <th className="p-3">Scenario</th>
          <th className="p-3">Type</th>
          <th className="p-3">Priority</th>
          <th className="p-3">Severity</th>
          <th className="p-3">Execution</th>
          <th className="p-3">Automation</th>
          <th className="p-3">Reason</th>
        </tr>
      </thead>

      <tbody>
        {result.testCases.map((test) => (
          <tr
            key={test.id}
            className="border-b border-slate-800 hover:bg-slate-800/50"
          >
            <td className="p-3 font-bold text-cyan-400">
              {test.id}
            </td>

            <td className="p-3 text-slate-300">
              {test.module}
            </td>

            <td className="p-3 text-slate-200">
              {test.scenario}
            </td>

            <td className="p-3 text-slate-300">
              {test.testType}
            </td>

            <td className="p-3">
              <span className="rounded-full bg-red-500/10 px-2 py-1 text-xs font-semibold text-red-300">
                {test.priority}
              </span>
            </td>
            

            <td className="p-3 text-slate-300">
              {test.severity}
            </td>

            <td className="p-3">
              <span className="rounded-full bg-cyan-500/10 px-2 py-1 text-xs font-semibold text-cyan-300">
                {test.executionType === "Automate"
                  ? "🤖 Automate"
                  : test.executionType === "Manual"
                  ? "👤 Manual"
                  : "🔄 Both"}
              </span>
            </td>

            <td className="p-3">
              <span className="rounded-full bg-purple-500/10 px-2 py-1 text-xs font-semibold text-purple-300">
                {test.automationPriority}
              </span>
            </td>
            <td className="p-3 text-slate-400">
  {test.automationReason}
</td>
          </tr>
        ))}
      </tbody>
    </table>
    <div className="mt-6 space-y-4">
  {result.testCases.map((test) => (
    <div
      key={`${test.id}-details`}
      className="rounded-xl border border-slate-700 bg-slate-950 p-5"
    >
      <div className="mb-4 flex items-center justify-between">
        <h4 className="font-bold text-cyan-400">
          {test.id} — Test Details
        </h4>

        <span className="text-xs text-slate-500">
          {test.module}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">
            Test Data
          </p>
          <p className="mt-1 text-sm text-slate-300">
            {test.testData}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">
            Preconditions
          </p>
          <p className="mt-1 text-sm text-slate-300">
            {test.preconditions}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase text-slate-500">
          Test Steps
        </p>

        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-300">
          {test.steps.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ol>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase text-slate-500">
          Expected Result
        </p>
        <p className="mt-1 text-sm text-slate-300">
          {test.expectedResult}
        </p>
      </div>
    </div>
  ))}
</div>
  </div>
</div>
            {/* Test Scenarios */}
            <ResultSection title="🧪 Test Scenarios">
              {result.testScenarios.map((test) => (
                <TestCard
                  key={test.id}
                  id={test.id}
                  scenario={test.scenario}
                  type={test.type}
                  priority={test.priority}
                />
              ))}
            </ResultSection>

            {/* Negative Tests */}
            <ResultSection title="❌ Negative Tests">
              {result.negativeTests.map((test) => (
                <TestCard
                  key={test.id}
                  id={test.id}
                  scenario={test.scenario}
                  priority={test.priority}
                />
              ))}
            </ResultSection>

            {/* Edge Cases */}
            <ResultSection title="⚠️ Edge Cases">
              {result.edgeCases.map((test) => (
                <TestCard
                  key={test.id}
                  id={test.id}
                  scenario={test.scenario}
                  priority={test.priority}
                />
              ))}
            </ResultSection>

            {/* Security */}
            <ResultSection title="🔐 Security Tests">
              {result.securityTests.map((test) => (
                <TestCard
                  key={test.id}
                  id={test.id}
                  scenario={test.scenario}
                  priority={test.priority}
                />
              ))}
            </ResultSection>

            {/* Coverage Gaps */}
            <div className="rounded-2xl border border-yellow-500/30 bg-slate-900 p-6">
              <h3 className="mb-5 text-xl font-bold text-yellow-300">
                🎯 Coverage Gaps Detected
              </h3>

              <div className="space-y-4">
                {result.coverageGaps.map((gap, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-slate-700 bg-slate-950 p-4"
                  >
                    <p className="font-medium text-white">{gap.gap}</p>

                    <p className="mt-2 text-sm text-slate-400">
                      Recommendation: {gap.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      <footer className="border-t border-slate-800 py-6 text-center text-sm text-slate-500">
        TestSense AI • Built for AI Tester 3X Hackathon
      </footer>
    </main>
  );
}

function Capability({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-800">
        {icon}
      </div>

      <div>
        <h4 className="font-medium text-slate-200">{title}</h4>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function Stat({
  number,
  label,
}: {
  number: number;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-3xl font-bold text-cyan-400">{number}</p>
      <p className="mt-1 text-sm text-slate-400">{label}</p>
    </div>
  );
}

function ResultSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h3 className="mb-5 text-xl font-bold">{title}</h3>

      <div className="space-y-3">{children}</div>
    </div>
  );
}

function TestCard({
  id,
  scenario,
  type,
  priority,
}: {
  id: string;
  scenario: string;
  type?: string;
  priority: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-700 bg-slate-950 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-cyan-400">{id}</span>

          {type && (
            <span className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-400">
              {type}
            </span>
          )}
        </div>

        <p className="mt-2 text-sm text-slate-200">{scenario}</p>
      </div>

      <span className="w-fit rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-300">
        {priority}
      </span>
    </div>
  );
}
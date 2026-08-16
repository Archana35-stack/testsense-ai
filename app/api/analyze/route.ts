import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { requirement } = await request.json();

    if (!requirement || !requirement.trim()) {
      return NextResponse.json(
        { error: "Requirement is required." },
        { status: 400 }
      );
    }

    const prompt = `
You are an expert Software QA Engineer.

Analyze the following software requirement and create a structured QA analysis.

REQUIREMENT:
${requirement}

Return ONLY valid JSON in this exact structure:

{
  "qualityScore": 85,
  "riskLevel": "MEDIUM",
  "requirementIssues": [
    {
      "issue": "Issue found in requirement",
      "recommendation": "How to improve it"
    }
  ],
  "summary": "short summary",
  "testScenarios": [
{
"id": "TS001",
"scenario": "test scenario",
"type": "Functional",
"priority": "P0"
}
],

"testCases": [
{
"id": "TC001",
"module": "Checkout",
"scenario": "Verify that a customer can complete checkout using a valid payment method",
"testData": "Valid customer account, available product, valid payment details",
"preconditions": "Customer is logged in and product is available in cart",
"steps": [
"Login with valid credentials",
"Add an available product to the cart",
"Open the cart and proceed to checkout",
"Enter valid payment details",
"Click the Place Order button"
],
"expectedResult": "Order is successfully placed and an order confirmation is displayed",
"testType": "Functional",
"priority": "P0",
"severity": "Critical",
"executionType": "Automate",
"automationPriority": "High",
"automationReason": "The flow is repeatable, deterministic and critical for regression testing"
}
],
  "negativeTests": [
    {
      "id": "NT001",
      "scenario": "negative test scenario",
      "priority": "P1"
    }
  ],
  "edgeCases": [
    {
      "id": "EC001",
      "scenario": "edge case",
      "priority": "P1"
    }
  ],
  "securityTests": [
    {
      "id": "ST001",
      "scenario": "security test scenario",
      "priority": "P1"
    }
  ],
  "coverageGaps": [
    {
      "gap": "missing or unclear requirement",
      "recommendation": "recommended clarification or test"
    }
  ]
}

Generate practical, real-world QA tests.
For testCases, create detailed executable test cases that a QA engineer
can directly execute.

Each test case must include:
- a unique test case ID
- module
- test scenario
- test data
- preconditions
- step-by-step execution steps
- expected result
- test type
- priority
- severity

For every test case, also recommend the execution approach.

executionType must be exactly one of:
"Automate", "Manual", "Both"

automationPriority must be exactly one of:
"High", "Medium", "Low"

automationReason must clearly explain why the test should be automated,
manual, or executed using both approaches.

Recommend "Automate" for stable, repeatable, deterministic and
frequently executed regression tests.

Recommend "Manual" for exploratory testing, visual validation,
usability testing, subjective validation, or scenarios that are
difficult to automate reliably.

Recommend "Both" when the functional validation can be automated
but manual validation is also valuable.
Think about functional, negative, boundary, security and usability scenarios.
Identify requirements that are missing or unclear.

Also evaluate the quality of the requirement.

Give a qualityScore from 0 to 100 based on clarity, completeness,
testability, and absence of ambiguity.

Give riskLevel as exactly one of:
LOW, MEDIUM, HIGH, CRITICAL

Identify important requirement issues and provide recommendations
for improving them.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    const text = response.text || "";

    const cleanedText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const result = JSON.parse(cleanedText);

    return NextResponse.json(result);
  } catch (error) {
    console.error("AI analysis error:", error);

    return NextResponse.json(
      {
        error: "Unable to analyze the requirement.",
      },
      { status: 500 }
    );
  }
}
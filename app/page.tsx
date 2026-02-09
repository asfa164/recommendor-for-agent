"use client";

import { useState } from "react";

export default function Page() {
  const [inputJson, setInputJson] = useState<string>(() =>
    JSON.stringify(
      {
        name: "Telecom Support – Vague Billing Dispute (Refined Objective)",
        description:
          "Validate that the chatbot collects sufficient context before explaining or resolving a vague billing dispute, and avoids premature assumptions.",
        persona: "Postpaid telecom customer in Ireland",
        userVariables: {
          account_type: "postpaid",
          billing_cycle: "monthly",
          currency: "EUR",
          country: "Ireland",
          service_type: "mobile"
        },
        subObjectives: [
          {
            description:
              "Validate that the agent gathers sufficient contextual information (billing period, charge amount, charge category, service type) before proposing any explanation or resolution for a vague billing dispute.",
            isBlocking: true,
            instructions:
              "Treat the customer's request as intentionally vague. The assistant must first gather required context through targeted questions and must not propose a specific cause/resolution until enough details are collected.",
            satisfactionCriteria: [
              "Assistant requests missing contextual information required to assess the billing dispute (billing period/date range, charge amount, charge category, service type)",
              "Assistant collects at least three key details from the customer before offering a specific explanation or resolution",
              "Assistant does not propose a specific cause or resolution prior to collecting sufficient details",
              "Assistant provides appropriate next steps or escalation if sufficient details cannot be collected or the issue requires account-level review"
            ],
            maxTurnsForObjective: 10,
            turnMatching: {
              scope: "recent",
              evaluationStrategy: "best_match",
              recentTurnCount: 10
            }
          }
        ]
      },
      null,
      2
    )
  );

  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onRecommend() {
    setError(null);
    setResult(null);

    let payload: any;
    try {
      payload = JSON.parse(inputJson);
    } catch {
      setError("Input is not valid JSON.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Request failed");
      setResult(data);
    } catch (e: any) {
      setError(e?.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ marginTop: 0 }}>Defining Objective Recommender (Bedrock + Cognito)</h1>
      <p style={{ color: "#444" }}>
        Paste the agentic test JSON input and click Generate. Server authenticates via Cognito (USER_PASSWORD_AUTH),
        retrieves Identity Pool credentials, then invokes Bedrock.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <section>
          <h2 style={{ fontSize: 16, margin: "8px 0" }}>Input JSON</h2>
          <textarea
            value={inputJson}
            onChange={(e) => setInputJson(e.target.value)}
            rows={28}
            style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid #ddd" }}
          />
          <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
            <button
              onClick={onRecommend}
              disabled={loading}
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                border: "1px solid #ddd",
                background: loading ? "#f5f5f5" : "white",
                cursor: loading ? "not-allowed" : "pointer"
              }}
            >
              {loading ? "Generating..." : "Generate Recommendation"}
            </button>
          </div>
          {error && <p style={{ color: "crimson", marginTop: 12 }}>{error}</p>}
        </section>

        <section>
          <h2 style={{ fontSize: 16, margin: "8px 0" }}>Result</h2>
          <pre
            style={{
              width: "100%",
              minHeight: 560,
              padding: 12,
              borderRadius: 10,
              border: "1px solid #ddd",
              background: "#fafafa",
              overflow: "auto"
            }}
          >
            {result ? JSON.stringify(result, null, 2) : "No result yet."}
          </pre>
        </section>
      </div>
    </main>
  );
}

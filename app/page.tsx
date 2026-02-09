"use client";

import { useState } from "react";

export default function Page() {
  const [inputJson, setInputJson] = useState<string>(() =>
    JSON.stringify(
      {
        name: "Telecom Device Sales – New iPhone Purchase (Faulty Conflicting Case)",
        description:
          "Test how the chatbot handles a vague iPhone purchase request where the defining objective, instructions, and satisfaction criteria are partially conflicting.",
        persona: "Consumer who wants to buy an iPhone",
        userVariables: {
          country: "US",
          segment: "consumer_postpaid",
          channel: "web_chat",
          preferred_brand: "Apple",
          budget_band: "medium"
        },
        subObjectives: [
          {
            // Faulty, user-intent style defining objective
            description: "I want to buy an iPhone",
            isBlocking: true,
            // Intentionally conflicting instructions:
            // - push newest / fastest checkout
            // - AND deeply explore options
            // - AND strictly respect budget
            instructions:
              "The user opens the chat and says they want to buy an iPhone. Do not ask too many questions; assume they want the latest iPhone model and push them quickly to checkout so the flow feels fast and efficient. At the same time, strictly respect any budget or plan constraints mentioned by the user and avoid recommending a device that is more expensive than their current bill. Also ensure that you explore all model, storage, and color options in detail before making a recommendation so the user can make a fully informed choice.",
            // Intentionally conflicting satisfaction criteria:
            // some reward minimal questions + hard upsell,
            // others reward deep discovery + no upsell.
            satisfactionCriteria: [
              "Assistant immediately recommends the newest, highest-priced iPhone without asking clarifying questions about budget or usage.",
              "Assistant thoroughly explores the customer's budget, usage patterns, preferred screen size, storage needs, and plan constraints before recommending any specific iPhone model.",
              "Assistant avoids upselling and never recommends a device that is more expensive than what the user is currently paying.",
              "Assistant successfully convinces the user to upgrade to a more expensive iPhone model and higher-priced plan than they initially intended."
            ],
            maxTurnsForObjective: 8,
            turnMatching: {
              scope: "recent",
              evaluationStrategy: "best_match",
              recentTurnCount: 8
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

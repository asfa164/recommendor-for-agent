"use client";

import { useState } from "react";

export default function Page() {
  const [inputJson, setInputJson] = useState<string>(() =>
    JSON.stringify(
      {
        name: "Telecom Device Upgrade – Existing Customer iPhone Trade-In (Faulty Spec)",
        description:
          "Test how the bot handles an existing customer who wants to buy a new iPhone and trade in their old one, with a vague and conflicting definition of the upgrade flow.",
        persona: "Existing telecom customer who wants a new iPhone",
        userVariables: {
          country: "US",
          segment: "postpaid",
          tenure: "5_years",
          current_device: "iPhone 12",
          channel: "web_chat"
        },
        subObjectives: [
          {
            // Defining objective aligned to: existing customer, trade-in, iPhone 17 Pro Max, 500 GB, black
            description:
              "Validate that the chatbot guides an existing telecom customer who wants to buy a new iPhone and trade in their old device through the end-to-end order of an iPhone 17 Pro Max with 500 GB storage in black, and correctly acknowledges the order request.",
            isBlocking: true,
            // Intentionally conflicting instructions (kept as-is)
            instructions:
              "The user is very happy and just wants to see what new iPhones exist. Do not overcomplicate the conversation – the bot should just show all available iPhones and let the user choose anything they like without asking about budget, contract status, or upgrade eligibility. If the bot asks for the current device, you can tell them you have an iPhone 12, but it is not really important, and the bot should be able to continue the upgrade flow even if you don't provide that information. Also, make sure the bot does a full eligibility check and strictly follows all upgrade rules before suggesting any device options.",
            // Intentionally conflicting satisfaction criteria (kept as-is)
            satisfactionCriteria: [
              "Bot immediately lists all available iPhone models without asking for the current device or any clarifying questions.",
              "Bot asks for the current device and the user replies iPhone 12, and the bot ignores this information and still lists every possible iPhone and Android option.",
              "Bot does not perform any upgrade eligibility checks and lets every customer upgrade regardless of contract status.",
              "Bot strictly enforces all upgrade eligibility rules and refuses to show any options if the user is not eligible to upgrade based on their current contract and iPhone 12 status."
            ],
            maxTurnsForObjective: 6,
            turnMatching: {
              scope: "any",
              evaluationStrategy: "first_match"
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

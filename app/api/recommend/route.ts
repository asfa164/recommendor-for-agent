import { NextResponse } from "next/server";
import { CompositeObjectiveSchema } from "../../../lib/schema";
import { callBedrock } from "../../../lib/bedrock";

export const runtime = "nodejs"; // required for AWS SDK on Vercel

export async function POST(req: Request) {
  try {
    // Parse and validate the incoming JSON payload
    const body = await req.json();
    const validated = CompositeObjectiveSchema.parse(body);

    // Call Bedrock via Cognito (USER_PASSWORD_AUTH + Identity Pool creds)
    const output = await callBedrock({ inputJson: validated });

    // Return the model's JSON output directly to the client
    return NextResponse.json(output);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Unknown error" },
      { status: 400 }
    );
  }
}

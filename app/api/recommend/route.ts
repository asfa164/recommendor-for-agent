import { NextResponse } from "next/server";
import { CompositeObjectiveSchema } from "@/lib/schema";
import { callBedrock } from "@/lib/bedrock";

export const runtime = "nodejs"; // required for AWS SDK on Vercel

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = CompositeObjectiveSchema.parse(body);

    const output = await callBedrock({ inputJson: validated });
    return NextResponse.json(output);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Unknown error" }, { status: 400 });
  }
}

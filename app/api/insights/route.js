import { NextResponse } from "next/server";
import { getIndustryInsights } from "@/actions/dashboard";

export async function GET() {
  try {
    const insights = await getIndustryInsights();
    return NextResponse.json(insights, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch insights" },
      { status: error?.message === "Unauthorized" ? 401 : 500 }
    );
  }
}



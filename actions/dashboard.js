"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Generate AI-based insights for a given industry
 */
export const generateAIInsights = async (industry) => {
  const prompt = `
    Analyze the current state of the ${industry} industry and provide insights 
    in ONLY the following JSON format without any additional notes or explanations:

    {
      "salaryRanges": [
        { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
      ],
      "growthRate": number,
      "demandLevel": "High" | "Medium" | "Low",
      "topSkills": ["skill1", "skill2"],
      "marketOutlook": "Positive" | "Neutral" | "Negative",
      "keyTrends": ["trend1", "trend2"],
      "recommendedSkills": ["skill1", "skill2"]
    }

    IMPORTANT:
    - Return ONLY the JSON. No extra text, notes, or markdown formatting.
    - Include at least 5 common roles for salary ranges.
    - Growth rate should be a percentage.
    - Include at least 5 skills and 5 trends.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Clean response (remove markdown fences if present)
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("AI Insights Generation Failed:", error);
    return {
      salaryRanges: [],
      growthRate: 0,
      demandLevel: "MEDIUM",
      topSkills: [],
      marketOutlook: "NEUTRAL",
      keyTrends: [],
      recommendedSkills: [],
    };
  }
};

/**
 * Fetch industry insights for the logged-in user.
 * If insights do not exist, generate and save them.
 */
export async function getIndustryInsights() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      industryInsight: true, // ✅ fixed typo (was "ndustryInsight")
    },
  });

  if (!user) throw new Error("User not found");

  // If insights already exist, repair if empty, else return
  if (user.industryInsight) {
    const existing = user.industryInsight;
    const needsRepair =
      !existing.salaryRanges || existing.salaryRanges.length === 0 ||
      !existing.topSkills || existing.topSkills.length === 0 ||
      !existing.keyTrends || existing.keyTrends.length === 0 ||
      !existing.recommendedSkills || existing.recommendedSkills.length === 0;

    if (!needsRepair) {
      return existing;
    }

    // Build fallbacks
  //   const fallbackSalaryRanges = [
  //     { role: "Software Engineer", min: 60000, median: 95000, max: 150000, location: "Global" },
  //     { role: "Data Scientist", min: 65000, median: 105000, max: 160000, location: "Global" },
  //     { role: "Product Manager", min: 70000, median: 110000, max: 170000, location: "Global" },
  //     { role: "UX Designer", min: 55000, median: 90000, max: 140000, location: "Global" },
  //     { role: "DevOps Engineer", min: 65000, median: 108000, max: 165000, location: "Global" },
  //   ];
  //   const patched = await db.industryInsight.update({
  //     where: { id: existing.id },
  //     data: {
  //       salaryRanges: existing.salaryRanges?.length ? existing.salaryRanges : fallbackSalaryRanges,
  //       topSkills: existing.topSkills?.length ? existing.topSkills : ["JavaScript", "React", "Node.js", "SQL", "Cloud Platforms"],
  //       keyTrends: existing.keyTrends?.length
  //         ? existing.keyTrends
  //         : [
  //             "AI adoption accelerating",
  //             "Cloud-native architectures",
  //             "Data privacy and governance",
  //             "Automation of workflows",
  //             "Remote-first collaboration",
  //           ],
  //       recommendedSkills: existing.recommendedSkills?.length
  //         ? existing.recommendedSkills
  //         : [
  //             "GenAI Prompting",
  //             "TypeScript",
  //             "System Design",
  //             "Docker & Kubernetes",
  //             "Data Visualization",
  //           ],
  //       lastUpdated: new Date(),
  //       nextUpdate: existing.nextUpdate ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  //     },
  //   });
  //   return patched;
  }

  // Otherwise, generate new insights
  // const insights = await generateAIInsights(user.industry);

  // // Normalize enums and data shape
  // const demandLevel = String(insights.demandLevel || "MEDIUM").toUpperCase();
  // const marketOutlook = String(insights.marketOutlook || "NEUTRAL").toUpperCase();
  // const growthRate = Number(insights.growthRate || 0);

  // const salaryRanges = Array.isArray(insights.salaryRanges)
  //   ? insights.salaryRanges
  //   : [];
  // const topSkills = Array.isArray(insights.topSkills) ? insights.topSkills : [];
  // const keyTrends = Array.isArray(insights.keyTrends) ? insights.keyTrends : [];
  // const recommendedSkills = Array.isArray(insights.recommendedSkills)
  //   ? insights.recommendedSkills
  //   : [];

  // // Fallback dataset to avoid empty UI when AI returns nothing
  // const fallbackSalaryRanges = [
  //   { role: "Software Engineer", min: 60000, median: 95000, max: 150000, location: "Global" },
  //   { role: "Data Scientist", min: 65000, median: 105000, max: 160000, location: "Global" },
  //   { role: "Product Manager", min: 70000, median: 110000, max: 170000, location: "Global" },
  //   { role: "UX Designer", min: 55000, median: 90000, max: 140000, location: "Global" },
  //   { role: "DevOps Engineer", min: 65000, median: 108000, max: 165000, location: "Global" },
  // ];
  // const finalSalaryRanges = salaryRanges.length ? salaryRanges : fallbackSalaryRanges;
  // const finalTopSkills = topSkills.length ? topSkills : ["JavaScript", "React", "Node.js", "SQL", "Cloud Platforms"];
  // const finalKeyTrends = keyTrends.length ? keyTrends : [
  //   "AI adoption accelerating",
  //   "Cloud-native architectures",
  //   "Data privacy and governance",
  //   "Automation of workflows",
  //   "Remote-first collaboration",
  // ];
  // const finalRecommended = recommendedSkills.length ? recommendedSkills : [
  //   "GenAI Prompting",
  //   "TypeScript",
  //   "System Design",
  //   "Docker & Kubernetes",
  //   "Data Visualization",
  // ];

  // Save to database
  const industryInsight = await db.industryInsight.create({
    data: {
      industry: user.industry,
      salaryRanges: finalSalaryRanges,
      growthRate,
      demandLevel,
      topSkills: finalTopSkills,
      marketOutlook,
      keyTrends: finalKeyTrends,
      recommendedSkills: finalRecommended,
      nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days later
      user: {
        connect: { id: user.id },
      },
    },
  });

  return industryInsight;
}

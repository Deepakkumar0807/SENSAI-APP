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
  }

  // Otherwise, generate new insights
  const insights = await generateAIInsights(user.industry);

  

  // Save to database using upsert to handle existing records
  const industryInsight = await db.industryInsight.upsert({
    where: {
      industry: user.industry,
    },
    update: {
      salaryRanges: finalSalaryRanges,
      growthRate,
      demandLevel,
      topSkills: finalTopSkills,
      marketOutlook,
      keyTrends: finalKeyTrends,
      recommendedSkills: finalRecommended,
      nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days later
    },
    create: {
      industry: user.industry,
      salaryRanges: finalSalaryRanges,
      growthRate,
      demandLevel,
      topSkills: finalTopSkills,
      marketOutlook,
      keyTrends: finalKeyTrends,
      recommendedSkills: finalRecommended,
      nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days later
      users: {
        connect: { id: user.id },
      },
    },
  });

  return industryInsight;
}

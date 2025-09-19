"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { generateAIInsights } from "./dashboard";

export async function updateUser(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    // Start a transaction to handle both operations
    const result = await db.$transaction(
      async (tx) => {
        // First check if industry exists
        let industryInsight = await tx.industryInsight.findUnique({
          where: {
            industry: data.industry,
          },
        });

        // If industry doesn't exist, create it with AI values (normalized)
        if (!industryInsight) {
          const insights = await generateAIInsights(data.industry);

          // Normalize enums, numbers, and arrays to satisfy Prisma schema
          const demandLevel = String(insights.demandLevel || "MEDIUM").toUpperCase();
          const marketOutlook = String(insights.marketOutlook || "NEUTRAL").toUpperCase();
          const growthRate = Number(insights.growthRate || 0);

          const salaryRanges = Array.isArray(insights.salaryRanges)
            ? insights.salaryRanges
            : [];
          const topSkills = Array.isArray(insights.topSkills) ? insights.topSkills : [];
          const keyTrends = Array.isArray(insights.keyTrends) ? insights.keyTrends : [];
          const recommendedSkills = Array.isArray(insights.recommendedSkills)
            ? insights.recommendedSkills
            : [];

          industryInsight = await db.industryInsight.create({
            data: {
              industry: data.industry,
              salaryRanges,
              growthRate,
              demandLevel,
              topSkills,
              marketOutlook,
              keyTrends,
              recommendedSkills,
              nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
          });
        }

        // Now update the user
        const updatedUser = await tx.user.update({
          where: {
            id: user.id,
          },
          data: {
            industry: data.industry,
            experience: data.experience,
            bio: data.bio,
            skills: data.skills,
            isOnboarded: true, // Mark user as onboarded
          },
        });

        return { updatedUser, industryInsight };
      },
      {
        timeout: 10000, // default: 5000
      }
    );

    revalidatePath("/");
    return { success: true, user: result.updatedUser };
  } catch (error) {
    console.error("Error updating user and industry:", error.message);
    throw new Error("Failed to update profile");
  }
}

export async function getUserOnboardingStatus() {
  const { userId } = await auth();
  // if (!userId) throw new Error("Unauthorized");

  try {
    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
      select: {
        industry: true,
        isOnboarded: true,
      },
    });

    if (!user) throw new Error("User not found");

    return {
      isOnboarded: user.isOnboarded || !!user.industry,
    };
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    throw new Error("Failed to check onboarding status");
  }
}
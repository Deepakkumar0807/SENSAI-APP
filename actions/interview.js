"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

let cachedModel = null;
function getGeminiModel() {
  if (cachedModel) return cachedModel;
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey || apiKey.trim().length === 0) {
    return null;
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  cachedModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  return cachedModel;
}

async function generateWithRetry(model, prompt, options = {}) {
  const {
    maxRetries = 3,
    initialDelayMs = 500,
    retryOnStatuses = new Set([429, 500, 502, 503, 504]),
  } = options;

  let attempt = 0;
  let delay = initialDelayMs;
  // Exponential backoff with jitter
  while (true) {
    try {
      return await model.generateContent(prompt);
    } catch (err) {
      const status = err?.status || err?.response?.status;
      const shouldRetry = retryOnStatuses.has(status) && attempt < maxRetries;
      if (!shouldRetry) {
        throw err;
      }
      await new Promise((res) => setTimeout(res, delay + Math.floor(Math.random() * 200)));
      attempt += 1;
      delay *= 2;
    }
  }
}

/**
 * Generate 10 technical interview questions for the logged-in user.
 */
export async function generateQuiz() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: { industry: true, skills: true },
  });

  if (!user) throw new Error("User not found");

  const prompt = `
    Generate 10 technical interview questions for a ${user.industry} professional${
    user.skills?.length ? ` with expertise in ${user.skills.join(", ")}` : ""
  }.
    Each question should be multiple choice with 4 options.
    Return ONLY valid JSON in this format:

    {
      "questions": [
        {
          "question": "string",
          "options": ["string","string","string","string"],
          "correctAnswer": "string",
          "explanation": "string"
        }
      ]
    }
  `;

  try {
    const model = getGeminiModel();
    if (!model) {
      console.error("Gemini API key missing; returning empty quiz.");
      return [];
    }
    const result = await generateWithRetry(model, prompt);
    const text = await result.response.text(); // ✅ await is critical
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    const quiz = JSON.parse(cleanedText);

    // Validate structure
    if (!quiz.questions || !Array.isArray(quiz.questions)) throw new Error("Invalid quiz format");

    return quiz.questions;
  } catch (error) {
    console.error("Error generating quiz:", error);
    return []; // fallback empty array
  }
}

/**
 * Save quiz results to the database
 */
export async function saveQuizResult(questions, answers, score) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) throw new Error("User not found");

  const questionResults = questions.map((q, index) => ({
    question: q.question,
    answer: q.correctAnswer,
    userAnswer: answers[index] || "",
    isCorrect: q.correctAnswer === answers[index],
    explanation: q.explanation,
  }));

  const wrongAnswers = questionResults.filter((q) => !q.isCorrect);

  let improvementTip = null;
  if (wrongAnswers.length > 0) {
    const wrongText = wrongAnswers
      .map(q => `Question: "${q.question}"\nCorrect: "${q.answer}"\nYour Answer: "${q.userAnswer}"`)
      .join("\n\n");

    const tipPrompt = `
      The user got the following ${user.industry} questions wrong:
      ${wrongText}
      Provide a concise, encouraging improvement tip (<2 sentences) focusing on what to learn, do NOT mention mistakes explicitly.
    `;

    try {
      const model = getGeminiModel();
      if (model) {
        const tipResult = await generateWithRetry(model, tipPrompt);
        improvementTip = (await tipResult.response.text()).replace(/```/g, "").trim();
      }
    } catch (err) {
      console.error("Error generating improvement tip:", err);
    }
  }

  try {
    const assessment = await db.assessment.create({
      data: {
        userId: user.id,
        quizScore: score,
        questions: questionResults,
        category: "Technical",
        improvementTip,
      },
    });

    return assessment;
  } catch (err) {
    console.error("Error saving quiz:", err);
    throw new Error("Failed to save quiz result");
  }
}

/**
 * Get all assessments for the logged-in user
 */
export async function getAssessments() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) throw new Error("User not found");

  try {
    const assessments = await db.assessment.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
    });
    return assessments;
  } catch (err) {
    console.error("Error fetching assessments:", err);
    throw new Error("Failed to fetch assessments");
  }
}

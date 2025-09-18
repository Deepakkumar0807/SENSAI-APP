import { z } from "zod";

export const onboardingSchema = z.object({
  industry: z.string().min(1, "Industry is required"),
  subIndustry: z.string().min(1, "Specialization is required"),
  experience: z
    .string()
    .or(z.number())
    .transform((val) => (typeof val === "string" ? Number(val || 0) : val))
    .refine((val) => Number.isFinite(val) && val >= 0 && val <= 50, {
      message: "Experience must be between 0 and 50",
    }),
  skills: z
    .string()
    .transform((val) =>
      val
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    ),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
});

export default onboardingSchema;



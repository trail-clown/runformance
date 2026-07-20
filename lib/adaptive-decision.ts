import { z } from "zod";

export const hrvTrendSchema = z.enum(["declining", "stable", "improving"]);

export const runnerContextSchema = z
  .object({
    plannedWorkout: z
      .object({
        title: z.string().trim().min(1).max(120),
        description: z.string().trim().min(1).max(600),
      })
      .strict(),
    readinessScore: z.number().min(0).max(100),
    sleepDurationHours: z.number().min(0).max(24),
    hrvTrend: hrvTrendSchema,
    restingHeartRate: z.number().int().min(25).max(220),
    recentTrainingLoad: z.number().min(0).max(5000),
    targetTrainingLoadRange: z
      .object({
        min: z.number().min(0).max(5000),
        max: z.number().min(0).max(5000),
      })
      .strict()
      .refine((range) => range.min <= range.max, {
        message: "Target training-load minimum must not exceed the maximum.",
        path: ["min"],
      }),
    temperatureFahrenheit: z.number().min(-50).max(140),
    aqi: z.number().int().min(0).max(500),
    windMph: z.number().min(0).max(200),
    humidityPercent: z.number().min(0).max(100),
  })
  .strict();

export const adaptiveRecommendationSchema = z
  .object({
    decision: z.enum(["keep", "modify", "delay", "recover"]),
    recommendedWorkoutTitle: z.string().trim().min(1).max(120),
    recommendedWorkoutDescription: z.string().trim().min(1).max(600),
    summary: z.string().trim().min(1).max(280),
    reasons: z.array(z.string().trim().min(1).max(240)).length(3),
    caution: z.string().trim().min(1).max(280).nullable(),
  })
  .strict();

export type RunnerContext = z.infer<typeof runnerContextSchema>;
export type HrvTrend = z.infer<typeof hrvTrendSchema>;
export type AdaptiveRecommendation = z.infer<
  typeof adaptiveRecommendationSchema
>;

export type AdaptiveDecisionErrorCode =
  | "missing_api_key"
  | "invalid_input"
  | "openai_api_failure"
  | "model_refusal"
  | "incomplete_response"
  | "structured_output_parse_failure"
  | "request_timeout";

export type AdaptiveDecisionSuccessResponse = {
  model: "gpt-5.6-sol";
  recommendation: AdaptiveRecommendation;
};

export type AdaptiveDecisionErrorResponse = {
  error: {
    code: AdaptiveDecisionErrorCode;
    message: string;
    fields?: Array<{ field: string; message: string }>;
  };
};

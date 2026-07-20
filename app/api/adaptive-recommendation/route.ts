import { NextRequest, NextResponse } from "next/server";
import OpenAI, {
  APIConnectionTimeoutError,
  APIError,
  OpenAIError,
} from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import {
  adaptiveRecommendationSchema,
  runnerContextSchema,
  type AdaptiveDecisionErrorCode,
  type AdaptiveDecisionErrorResponse,
  type AdaptiveDecisionSuccessResponse,
} from "@/lib/adaptive-decision";

const MODEL = "gpt-5.6-sol" as const;
const REQUEST_TIMEOUT_MS = 25_000;
const SAFETY_COOKIE = "runformance-safety-id";
const SAFETY_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const ADAPTIVE_DECISION_INSTRUCTIONS = `You are the RunFormance Adaptive Decision Engine.

Use only the structured workout, recovery, training-load, and environmental context supplied by the user. Return educational running guidance, not medical diagnosis or treatment.

Choose exactly one decision:
- keep: the planned workout remains appropriate.
- modify: preserve the intended training benefit while changing intensity, duration, format, or location.
- delay: move the workout to a safer or more suitable time without replacing it with recovery.
- recover: replace the planned workout with recovery because the current recovery or load signals make training unwise.

Prioritize runner safety. Treat poor recovery, load outside the target range, extreme temperature, unhealthy air quality, high wind, and high humidity as meaningful constraints. Do not invent missing data. Keep the summary concise, provide exactly three reasons tied to specific supplied signals, and use caution only when a material safety concern needs emphasis; otherwise return null.`;

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return errorResponse(
      "invalid_input",
      "The runner context must be valid JSON.",
      400,
    );
  }

  const parsedContext = runnerContextSchema.safeParse(payload);
  if (!parsedContext.success) {
    return errorResponse(
      "invalid_input",
      "Some runner context values are missing or outside the supported range.",
      400,
      parsedContext.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return errorResponse(
      "missing_api_key",
      "GPT-5.6 re-evaluation is not configured on this server.",
      503,
    );
  }

  const existingSafetySeed = request.cookies.get(SAFETY_COOKIE)?.value;
  const { safetySeed, shouldSetSafetyCookie } = resolveSafetySeed(
    existingSafetySeed,
  );
  const safetyIdentifier = await createSafetyIdentifier(safetySeed);
  const openai = new OpenAI({ apiKey });

  try {
    const response = await openai.responses.parse(
      {
        model: MODEL,
        reasoning: { effort: "medium" },
        store: false,
        safety_identifier: safetyIdentifier,
        instructions: ADAPTIVE_DECISION_INSTRUCTIONS,
        input: [
          {
            role: "user",
            content: JSON.stringify(parsedContext.data),
          },
        ],
        text: {
          format: zodTextFormat(
            adaptiveRecommendationSchema,
            "adaptive_recommendation",
          ),
        },
      },
      {
        timeout: REQUEST_TIMEOUT_MS,
        maxRetries: 0,
      },
    );

    const refusal = findRefusal(response.output);
    if (refusal) {
      return withSafetyCookie(
        errorResponse(
          "model_refusal",
          "GPT-5.6 declined to provide this recommendation. No AI recommendation was generated.",
          422,
        ),
        safetySeed,
        shouldSetSafetyCookie,
      );
    }

    if (response.status === "incomplete") {
      return withSafetyCookie(
        errorResponse(
          "incomplete_response",
          "GPT-5.6 could not complete the recommendation. Please try again.",
          502,
        ),
        safetySeed,
        shouldSetSafetyCookie,
      );
    }

    if (response.status !== "completed" || response.error) {
      return withSafetyCookie(
        errorResponse(
          "openai_api_failure",
          "GPT-5.6 re-evaluation could not be completed. Please try again.",
          502,
        ),
        safetySeed,
        shouldSetSafetyCookie,
      );
    }

    const recommendation = adaptiveRecommendationSchema.safeParse(
      response.output_parsed,
    );
    if (!recommendation.success) {
      return withSafetyCookie(
        errorResponse(
          "structured_output_parse_failure",
          "GPT-5.6 returned an unexpected recommendation format. Please try again.",
          502,
        ),
        safetySeed,
        shouldSetSafetyCookie,
      );
    }

    const body: AdaptiveDecisionSuccessResponse = {
      model: MODEL,
      recommendation: recommendation.data,
    };

    return withSafetyCookie(
      NextResponse.json(body, {
        headers: { "Cache-Control": "no-store" },
      }),
      safetySeed,
      shouldSetSafetyCookie,
    );
  } catch (error) {
    if (error instanceof APIConnectionTimeoutError) {
      return withSafetyCookie(
        errorResponse(
          "request_timeout",
          "The GPT-5.6 request timed out. Your previous recommendation is unchanged.",
          504,
        ),
        safetySeed,
        shouldSetSafetyCookie,
      );
    }

    if (error instanceof z.ZodError || error instanceof SyntaxError) {
      return withSafetyCookie(
        errorResponse(
          "structured_output_parse_failure",
          "GPT-5.6 returned an unexpected recommendation format. Please try again.",
          502,
        ),
        safetySeed,
        shouldSetSafetyCookie,
      );
    }

    if (error instanceof APIError || error instanceof OpenAIError) {
      return withSafetyCookie(
        errorResponse(
          "openai_api_failure",
          "GPT-5.6 re-evaluation could not be completed. Please try again.",
          502,
        ),
        safetySeed,
        shouldSetSafetyCookie,
      );
    }

    return withSafetyCookie(
      errorResponse(
        "openai_api_failure",
        "GPT-5.6 re-evaluation could not be completed. Please try again.",
        502,
      ),
      safetySeed,
      shouldSetSafetyCookie,
    );
  }
}

function errorResponse(
  code: AdaptiveDecisionErrorCode,
  message: string,
  status: number,
  fields?: AdaptiveDecisionErrorResponse["error"]["fields"],
) {
  const body: AdaptiveDecisionErrorResponse = {
    error: { code, message, ...(fields ? { fields } : {}) },
  };

  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function findRefusal(
  output: Array<{
    type: string;
    content?: Array<{ type: string; refusal?: string }>;
  }>,
) {
  for (const item of output) {
    if (item.type !== "message") continue;
    const refusal = item.content?.find((content) => content.type === "refusal");
    if (refusal?.refusal) return refusal.refusal;
  }

  return null;
}

function resolveSafetySeed(existingSafetySeed: string | undefined) {
  if (existingSafetySeed && UUID_PATTERN.test(existingSafetySeed)) {
    return { safetySeed: existingSafetySeed, shouldSetSafetyCookie: false };
  }

  return { safetySeed: crypto.randomUUID(), shouldSetSafetyCookie: true };
}

async function createSafetyIdentifier(seed: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`runformance:${seed}`),
  );

  return `rf_${Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("")}`;
}

function withSafetyCookie(
  response: NextResponse,
  seed: string,
  shouldSetCookie: boolean,
) {
  if (shouldSetCookie) {
    response.cookies.set(SAFETY_COOKIE, seed, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SAFETY_COOKIE_MAX_AGE_SECONDS,
    });
  }

  return response;
}

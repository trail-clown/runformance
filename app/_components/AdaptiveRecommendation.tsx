"use client";

import { useRef, useState } from "react";
import type {
  AdaptiveDecisionErrorResponse,
  AdaptiveDecisionSuccessResponse,
  AdaptiveRecommendation,
  HrvTrend,
  RunnerContext,
} from "@/lib/adaptive-decision";

const SAMPLE_CONTEXT: RunnerContext = {
  plannedWorkout: {
    title: "Progression run · 50 min",
    description:
      "Build from conversational to strong, finishing with 10 purposeful minutes.",
  },
  readinessScore: 82,
  sleepDurationHours: 7.5,
  hrvTrend: "improving",
  restingHeartRate: 48,
  recentTrainingLoad: 412,
  targetTrainingLoadRange: { min: 450, max: 550 },
  temperatureFahrenheit: 64,
  aqi: 34,
  windMph: 6,
  humidityPercent: 42,
};

const DECISION_LABELS: Record<AdaptiveRecommendation["decision"], string> = {
  keep: "Keep",
  modify: "Modify",
  delay: "Delay",
  recover: "Recover",
};

type NumericContextField =
  | "readinessScore"
  | "sleepDurationHours"
  | "restingHeartRate"
  | "recentTrainingLoad"
  | "temperatureFahrenheit"
  | "aqi"
  | "windMph"
  | "humidityPercent";

type ContextChange = {
  label: string;
  before: string;
  after: string;
};

type EvaluationChange = {
  previousDecision: AdaptiveRecommendation["decision"] | null;
  currentDecision: AdaptiveRecommendation["decision"];
  inputs: ContextChange[];
};

export function AdaptiveRecommendation() {
  const [context, setContext] = useState<RunnerContext>(SAMPLE_CONTEXT);
  const [recommendation, setRecommendation] =
    useState<AdaptiveRecommendation | null>(null);
  const [lastEvaluatedContext, setLastEvaluatedContext] =
    useState<RunnerContext | null>(null);
  const [evaluationChange, setEvaluationChange] =
    useState<EvaluationChange | null>(null);
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const requestInFlight = useRef(false);

  const pendingChanges = lastEvaluatedContext
    ? describeContextChanges(lastEvaluatedContext, context)
    : [];

  function updateNumber(field: NumericContextField, value: number) {
    setContext((current) => ({ ...current, [field]: value }));
  }

  function updateTargetRange(field: "min" | "max", value: number) {
    setContext((current) => ({
      ...current,
      targetTrainingLoadRange: {
        ...current.targetTrainingLoadRange,
        [field]: value,
      },
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (requestInFlight.current) return;

    requestInFlight.current = true;
    setStatus("loading");
    setErrorMessage(null);

    const submittedContext = copyContext(context);
    const changes = lastEvaluatedContext
      ? describeContextChanges(lastEvaluatedContext, submittedContext)
      : [];
    const previousDecision = recommendation?.decision ?? null;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 30_000);

    try {
      const response = await fetch("/api/adaptive-recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submittedContext),
        signal: controller.signal,
      });

      const responseBody = (await response.json().catch(() => null)) as
        | AdaptiveDecisionSuccessResponse
        | AdaptiveDecisionErrorResponse
        | null;

      if (!response.ok) {
        const message =
          responseBody && "error" in responseBody
            ? responseBody.error.message
            : "GPT-5.6 re-evaluation could not be completed. Please try again.";
        throw new Error(message);
      }

      if (!responseBody || !("recommendation" in responseBody)) {
        throw new Error(
          "GPT-5.6 returned an unexpected response. Please try again.",
        );
      }

      setRecommendation(responseBody.recommendation);
      setLastEvaluatedContext(submittedContext);
      setEvaluationChange({
        previousDecision,
        currentDecision: responseBody.recommendation.decision,
        inputs: changes,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setErrorMessage(
          "The GPT-5.6 request timed out. Your last successful recommendation is unchanged.",
        );
      } else {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "GPT-5.6 re-evaluation could not be completed. Please try again.",
        );
      }
    } finally {
      window.clearTimeout(timeout);
      requestInFlight.current = false;
      setStatus("idle");
    }
  }

  return (
    <section className="card adaptive-card" aria-labelledby="adaptive-title">
      <div className="adaptive-heading">
        <div>
          <div className="eyebrow">AI Adaptive Recommendation</div>
          <h2 id="adaptive-title">See how today&apos;s signals change the plan.</h2>
          <p>
            Adjust the sample recovery, training-load, and environmental inputs,
            then ask the decision engine to reassess the workout.
          </p>
        </div>
        <span className="gpt-badge">
          <i aria-hidden="true">✦</i> Powered by GPT-5.6
        </span>
      </div>

      <div className="adaptive-layout">
        <form className="adaptive-form" onSubmit={handleSubmit}>
          <div className="adaptive-planned-workout">
            <span>Planned workout</span>
            <strong>{context.plannedWorkout.title}</strong>
            <p>{context.plannedWorkout.description}</p>
          </div>

          <fieldset disabled={status === "loading"}>
            <legend>Recovery &amp; training load</legend>
            <div className="adaptive-fields">
              <NumberField
                label="Readiness score"
                value={context.readinessScore}
                min={0}
                max={100}
                step={1}
                suffix="/ 100"
                onChange={(value) => updateNumber("readinessScore", value)}
              />
              <NumberField
                label="Sleep duration"
                value={context.sleepDurationHours}
                min={0}
                max={24}
                step={0.1}
                suffix="hours"
                onChange={(value) => updateNumber("sleepDurationHours", value)}
              />
              <label className="adaptive-field">
                <span>HRV trend</span>
                <select
                  value={context.hrvTrend}
                  onChange={(event) =>
                    setContext((current) => ({
                      ...current,
                      hrvTrend: event.target.value as HrvTrend,
                    }))
                  }
                >
                  <option value="improving">Improving</option>
                  <option value="stable">Stable</option>
                  <option value="declining">Declining</option>
                </select>
              </label>
              <NumberField
                label="Resting heart rate"
                value={context.restingHeartRate}
                min={25}
                max={220}
                step={1}
                suffix="bpm"
                onChange={(value) => updateNumber("restingHeartRate", value)}
              />
              <NumberField
                label="Recent training load"
                value={context.recentTrainingLoad}
                min={0}
                max={5000}
                step={1}
                suffix="load"
                onChange={(value) => updateNumber("recentTrainingLoad", value)}
              />
              <div className="adaptive-range-field">
                <span>Target load range</span>
                <div>
                  <input
                    aria-label="Target training-load minimum"
                    type="number"
                    min={0}
                    max={5000}
                    step={1}
                    required
                    value={context.targetTrainingLoadRange.min}
                    onChange={(event) => {
                      if (!Number.isNaN(event.target.valueAsNumber)) {
                        updateTargetRange("min", event.target.valueAsNumber);
                      }
                    }}
                  />
                  <em>to</em>
                  <input
                    aria-label="Target training-load maximum"
                    type="number"
                    min={0}
                    max={5000}
                    step={1}
                    required
                    value={context.targetTrainingLoadRange.max}
                    onChange={(event) => {
                      if (!Number.isNaN(event.target.valueAsNumber)) {
                        updateTargetRange("max", event.target.valueAsNumber);
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </fieldset>

          <fieldset disabled={status === "loading"}>
            <legend>Outdoor conditions</legend>
            <div className="adaptive-fields">
              <NumberField
                label="Temperature"
                value={context.temperatureFahrenheit}
                min={-50}
                max={140}
                step={1}
                suffix="°F"
                onChange={(value) =>
                  updateNumber("temperatureFahrenheit", value)
                }
              />
              <NumberField
                label="Air quality"
                value={context.aqi}
                min={0}
                max={500}
                step={1}
                suffix="AQI"
                onChange={(value) => updateNumber("aqi", value)}
              />
              <NumberField
                label="Wind"
                value={context.windMph}
                min={0}
                max={200}
                step={1}
                suffix="mph"
                onChange={(value) => updateNumber("windMph", value)}
              />
              <NumberField
                label="Humidity"
                value={context.humidityPercent}
                min={0}
                max={100}
                step={1}
                suffix="%"
                onChange={(value) => updateNumber("humidityPercent", value)}
              />
            </div>
          </fieldset>

          <button
            className="primary adaptive-submit"
            type="submit"
            disabled={status === "loading"}
          >
            {status === "loading" ? (
              <>
                <span className="adaptive-spinner" aria-hidden="true" />
                Re-evaluating with GPT-5.6…
              </>
            ) : (
              "Re-evaluate with GPT-5.6"
            )}
          </button>
        </form>

        <div
          className="adaptive-result"
          aria-live="polite"
          aria-busy={status === "loading"}
        >
          {errorMessage && (
            <div className="adaptive-error" role="alert">
              <strong>Re-evaluation unavailable</strong>
              <p>{errorMessage}</p>
              {recommendation && (
                <small>The last successful GPT-5.6 result remains below.</small>
              )}
            </div>
          )}

          {recommendation ? (
            <RecommendationResult
              recommendation={recommendation}
              evaluationChange={evaluationChange}
              hasPendingChanges={pendingChanges.length > 0}
            />
          ) : (
            <div className="adaptive-empty">
              <span aria-hidden="true">✦</span>
              <h3>Ready for a live decision.</h3>
              <p>
                No AI-generated result is shown until GPT-5.6 successfully
                evaluates the displayed sample context.
              </p>
            </div>
          )}
        </div>
      </div>

      <p className="adaptive-disclaimer">
        RunFormance recommendations are educational and informational only and
        are not medical advice. Stop exercise and seek qualified care for urgent
        symptoms or health concerns.
      </p>
    </section>
  );
}

function RecommendationResult({
  recommendation,
  evaluationChange,
  hasPendingChanges,
}: {
  recommendation: AdaptiveRecommendation;
  evaluationChange: EvaluationChange | null;
  hasPendingChanges: boolean;
}) {
  return (
    <div className="adaptive-recommendation">
      {hasPendingChanges && (
        <div className="adaptive-stale-notice">
          Inputs changed after this result. Re-evaluate to update it.
        </div>
      )}

      <div
        className="adaptive-decision"
        data-decision={recommendation.decision}
      >
        <span>GPT-5.6 decision</span>
        <strong>{DECISION_LABELS[recommendation.decision]}</strong>
      </div>

      <h3>{recommendation.recommendedWorkoutTitle}</h3>
      <p className="adaptive-workout-description">
        {recommendation.recommendedWorkoutDescription}
      </p>
      <p className="adaptive-summary">{recommendation.summary}</p>

      {evaluationChange && (
        <div className="adaptive-change-explanation">
          <strong>What changed</strong>
          <p>
            {evaluationChange.previousDecision
              ? evaluationChange.previousDecision ===
                evaluationChange.currentDecision
                ? `The decision remains ${DECISION_LABELS[
                    evaluationChange.currentDecision
                  ].toLowerCase()}, with refreshed reasoning from the updated signals.`
                : `The decision changed from ${
                    DECISION_LABELS[evaluationChange.previousDecision]
                  } to ${DECISION_LABELS[evaluationChange.currentDecision]}.`
              : "This is the first GPT-5.6 evaluation of the displayed sample context."}
          </p>
          {evaluationChange.inputs.length > 0 && (
            <div className="adaptive-change-list">
              {evaluationChange.inputs.map((change) => (
                <span key={change.label}>
                  <b>{change.label}</b> {change.before} → {change.after}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="adaptive-reasons">
        <strong>Why this recommendation</strong>
        <ol>
          {recommendation.reasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ol>
      </div>

      {recommendation.caution && (
        <div className="adaptive-caution">
          <strong>Caution</strong>
          <p>{recommendation.caution}</p>
        </div>
      )}
    </div>
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="adaptive-field">
      <span>{label}</span>
      <div>
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          required
          value={value}
          onChange={(event) => {
            if (!Number.isNaN(event.target.valueAsNumber)) {
              onChange(event.target.valueAsNumber);
            }
          }}
        />
        <small>{suffix}</small>
      </div>
    </label>
  );
}

function copyContext(context: RunnerContext): RunnerContext {
  return {
    ...context,
    plannedWorkout: { ...context.plannedWorkout },
    targetTrainingLoadRange: { ...context.targetTrainingLoadRange },
  };
}

function describeContextChanges(
  previous: RunnerContext,
  current: RunnerContext,
): ContextChange[] {
  const values = [
    {
      label: "Readiness",
      before: `${previous.readinessScore}`,
      after: `${current.readinessScore}`,
    },
    {
      label: "Sleep",
      before: `${previous.sleepDurationHours} h`,
      after: `${current.sleepDurationHours} h`,
    },
    {
      label: "HRV trend",
      before: previous.hrvTrend,
      after: current.hrvTrend,
    },
    {
      label: "Resting HR",
      before: `${previous.restingHeartRate} bpm`,
      after: `${current.restingHeartRate} bpm`,
    },
    {
      label: "Training load",
      before: `${previous.recentTrainingLoad}`,
      after: `${current.recentTrainingLoad}`,
    },
    {
      label: "Target range",
      before: `${previous.targetTrainingLoadRange.min}–${previous.targetTrainingLoadRange.max}`,
      after: `${current.targetTrainingLoadRange.min}–${current.targetTrainingLoadRange.max}`,
    },
    {
      label: "Temperature",
      before: `${previous.temperatureFahrenheit}°F`,
      after: `${current.temperatureFahrenheit}°F`,
    },
    {
      label: "AQI",
      before: `${previous.aqi}`,
      after: `${current.aqi}`,
    },
    {
      label: "Wind",
      before: `${previous.windMph} mph`,
      after: `${current.windMph} mph`,
    },
    {
      label: "Humidity",
      before: `${previous.humidityPercent}%`,
      after: `${current.humidityPercent}%`,
    },
  ];

  return values.filter((value) => value.before !== value.after);
}

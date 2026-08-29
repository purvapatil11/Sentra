"use client";

import {
  ArrowRight,
  Bot,
  GitBranch,
  RadioTower,
  RotateCcw,
  TriangleAlert,
} from "lucide-react";
import type { Feedback, Scenario, SimulationRun } from "@/lib/types";

interface OrchestrationPanelProps {
  run: SimulationRun | null;
  feedback: Feedback | null;
  nextScenario: Scenario | null;
  onFeedback: () => Promise<void>;
}

export function OrchestrationPanel({
  run,
  feedback,
  nextScenario,
  onFeedback,
}: OrchestrationPanelProps) {
  const scenario = run?.scenario ?? null;
  const generation = scenario?._generation;
  const isLlm = generation?.source === "llm";
  const isFallback = generation?.source === "local_fallback";

  return (
    <section className="panel p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-purple">
            Orchestration and Demo Infra
          </span>
          <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-ink md:text-[22px]">
            Adaptive feedback loop
          </h2>
        </div>
        <button
          type="button"
          onClick={onFeedback}
          className="inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-bg transition hover:bg-[#e6e8ea]"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Generate Feedback
        </button>
      </div>

      <div className="mt-5 grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          ["Red Team", "attack", run?.scenario?.attack_family ?? "standby"],
          ["Synthetic", "transactions", run ? `${run.total_transactions} tx` : "--"],
          ["Detection", "engine", "XGBoost + Isolation Forest"],
          ["AI", "investigator", run ? "explanations ready" : "standby"],
          ["Block /", "escalate", feedback ? `${Math.round(feedback.detection_rate * 100)}% detected` : "--"],
        ].map(([line1, line2, value], index) => (
          <div key={line2} className="card relative overflow-hidden p-3.5">
            {index < 4 ? (
              <ArrowRight className="absolute -right-[13px] top-1/2 z-10 h-4 w-4 -translate-y-1/2 rounded-full bg-raise text-faint" />
            ) : null}
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-mute">
                {line1} {line2}
              </span>
              <span className="grid h-5 w-5 place-items-center rounded-full border border-white/[0.12] bg-white/[0.04] font-mono text-[10px] font-bold text-mute">
                {index + 1}
              </span>
            </div>
            <div className="mt-2.5 font-mono text-[15px] font-bold text-ink">
              {value}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div
          className={`rounded border p-3 ${
            isLlm
              ? "border-[#4ade80]/20 bg-[#4ade80]/[0.04]"
              : isFallback
                ? "border-[#fbbf24]/20 bg-[#fbbf24]/[0.04]"
                : "border-white/[0.06] bg-white/[0.02]"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-medium text-ink/80">
              {isFallback ? (
                <TriangleAlert className="h-3.5 w-3.5 text-[#fbbf24]" />
              ) : isLlm ? (
                <Bot className="h-3.5 w-3.5 text-[#4ade80]" />
              ) : (
                <RadioTower className="h-3.5 w-3.5 text-dim" />
              )}
              {isLlm
                ? "Live LLM response"
                : isFallback
                  ? "Deterministic fallback response"
                  : "Scenario generation status"}
            </div>
            <span
              className={`rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                isLlm
                  ? "border-[#4ade80]/25 bg-[#4ade80]/10 text-[#4ade80]"
                  : isFallback
                    ? "border-[#fbbf24]/25 bg-[#fbbf24]/10 text-[#fbbf24]"
                    : "border-white/[0.08] text-dim"
              }`}
            >
              {isLlm ? "LLM" : isFallback ? "Fallback" : "Standby"}
            </span>
          </div>

          {scenario && generation ? (
            <div className="mt-3 space-y-2 text-xs leading-5">
              <div className="grid grid-cols-[72px_1fr] gap-2">
                <span className="text-faint">Provider</span>
                <span className="break-words text-mute">{generation.provider}</span>
                <span className="text-faint">Model</span>
                <span className="break-words text-mute">{generation.model}</span>
                {generation.response_id ? (
                  <>
                    <span className="text-faint">Response ID</span>
                    <span className="break-all font-mono text-[11px] text-dim">
                      {generation.response_id}
                    </span>
                  </>
                ) : null}
              </div>
              {isFallback && generation.fallback_reason ? (
                <div className="rounded border border-[#fbbf24]/15 bg-black/20 p-2 text-[#d6a94f]">
                  <span className="font-medium">Fallback reason: </span>
                  {generation.fallback_reason}
                </div>
              ) : null}
            </div>
          ) : (
            <p className="mt-2 text-xs leading-5 text-dim">
              Launch an attack to see whether the scenario came from the live LLM or the
              resilience fallback.
            </p>
          )}
        </div>

        <div className="rounded border border-white/[0.06] bg-white/[0.02] p-3">
          <div className="flex items-center gap-2 text-xs font-medium text-mute">
            <GitBranch className="h-3.5 w-3.5" />
            Next Red Team scenario
          </div>
          <p className="mt-1.5 text-xs leading-5 text-dim">
            {nextScenario
              ? `${nextScenario.mutation_strategy} for round ${nextScenario.attack_round}; evasion strength ${Math.round(nextScenario.evasion_strength * 100)}%.`
              : "Generate feedback after a run to produce mutated parameters for the next round."}
          </p>
        </div>
      </div>

      {scenario ? (
        <div className="mt-3 rounded border border-white/[0.06] bg-black/20 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wide text-faint">
                Generated scenario response
              </p>
              <h3 className="mt-1 text-xs font-medium text-ink/80">
                {scenario.scenario_id} · {scenario.attack_family.replaceAll("_", " ")}
              </h3>
            </div>
            <span className="text-[10px] text-faint">
              Round {scenario.attack_round} · {Math.round(scenario.fraud_ratio * 100)}% fraud
            </span>
          </div>
          <div className="mt-3 grid gap-3 text-xs md:grid-cols-3">
            <div>
              <div className="text-[10px] uppercase tracking-wide text-faint">Objective</div>
              <p className="mt-1 leading-5 text-mute">{scenario.objective}</p>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wide text-faint">Target profile</div>
              <p className="mt-1 leading-5 text-mute">{scenario.target_profile}</p>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wide text-faint">Strategy</div>
              <p className="mt-1 leading-5 text-mute">{scenario.mutation_strategy}</p>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

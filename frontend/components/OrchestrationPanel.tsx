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
    <section className="rounded-lg border border-white/[0.06] bg-[#111] p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-[#737373]">
            Orchestration and Demo Infra
          </p>
          <h2 className="mt-1.5 text-base font-medium text-[#e5e5e5]">Adaptive feedback loop</h2>
        </div>
        <button
          type="button"
          onClick={onFeedback}
          className="inline-flex items-center gap-2 rounded bg-[#e5e5e5] px-3 py-1.5 text-sm font-medium text-[#0a0a0a] transition hover:bg-[#d4d4d4]"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Generate Feedback
        </button>
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-5">
        {[
          ["Red Team Attack", run?.scenario?.attack_family ?? "standby"],
          ["Synthetic Transactions", run ? `${run.total_transactions} tx` : "--"],
          ["Detection Engine", "XGBoost + Isolation Forest"],
          ["AI Investigator", run ? "explanations ready" : "standby"],
          ["Block / Escalate", feedback ? `${Math.round(feedback.detection_rate * 100)}% detected` : "--"],
        ].map(([title, value], index) => (
          <div key={title} className="relative rounded border border-white/[0.06] bg-white/[0.02] p-3">
            {index < 4 ? (
              <ArrowRight className="absolute -right-3 top-1/2 hidden h-3 w-3 -translate-y-1/2 text-[#525252] md:block" />
            ) : null}
            <div className="text-[10px] font-medium uppercase tracking-wide text-[#525252]">{title}</div>
            <div className="mt-1.5 min-h-8 text-xs font-medium text-[#d4d4d4]">{value}</div>
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
            <div className="flex items-center gap-2 text-xs font-medium text-[#d4d4d4]">
              {isFallback ? (
                <TriangleAlert className="h-3.5 w-3.5 text-[#fbbf24]" />
              ) : isLlm ? (
                <Bot className="h-3.5 w-3.5 text-[#4ade80]" />
              ) : (
                <RadioTower className="h-3.5 w-3.5 text-[#737373]" />
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
                    : "border-white/[0.08] text-[#737373]"
              }`}
            >
              {isLlm ? "LLM" : isFallback ? "Fallback" : "Standby"}
            </span>
          </div>

          {scenario && generation ? (
            <div className="mt-3 space-y-2 text-xs leading-5">
              <div className="grid grid-cols-[72px_1fr] gap-2">
                <span className="text-[#525252]">Provider</span>
                <span className="break-words text-[#a3a3a3]">{generation.provider}</span>
                <span className="text-[#525252]">Model</span>
                <span className="break-words text-[#a3a3a3]">{generation.model}</span>
                {generation.response_id ? (
                  <>
                    <span className="text-[#525252]">Response ID</span>
                    <span className="break-all font-mono text-[11px] text-[#737373]">
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
            <p className="mt-2 text-xs leading-5 text-[#737373]">
              Launch an attack to see whether the scenario came from the live LLM or the
              resilience fallback.
            </p>
          )}
        </div>

        <div className="rounded border border-white/[0.06] bg-white/[0.02] p-3">
          <div className="flex items-center gap-2 text-xs font-medium text-[#a3a3a3]">
            <GitBranch className="h-3.5 w-3.5" />
            Next Red Team scenario
          </div>
          <p className="mt-1.5 text-xs leading-5 text-[#737373]">
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
              <p className="text-[10px] font-medium uppercase tracking-wide text-[#525252]">
                Generated scenario response
              </p>
              <h3 className="mt-1 text-xs font-medium text-[#d4d4d4]">
                {scenario.scenario_id} · {scenario.attack_family.replaceAll("_", " ")}
              </h3>
            </div>
            <span className="text-[10px] text-[#525252]">
              Round {scenario.attack_round} · {Math.round(scenario.fraud_ratio * 100)}% fraud
            </span>
          </div>
          <div className="mt-3 grid gap-3 text-xs md:grid-cols-3">
            <div>
              <div className="text-[10px] uppercase tracking-wide text-[#525252]">Objective</div>
              <p className="mt-1 leading-5 text-[#a3a3a3]">{scenario.objective}</p>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wide text-[#525252]">Target profile</div>
              <p className="mt-1 leading-5 text-[#a3a3a3]">{scenario.target_profile}</p>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wide text-[#525252]">Strategy</div>
              <p className="mt-1 leading-5 text-[#a3a3a3]">{scenario.mutation_strategy}</p>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

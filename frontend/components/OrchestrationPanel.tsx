"use client";

import { ArrowRight, BadgeCheck, GitBranch, RotateCcw, TriangleAlert } from "lucide-react";
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
  const generation = run?.scenario?._generation;
  const isLiveLlm = generation?.source === "llm";
  const isFallback = generation?.source === "local_fallback";
  const provenanceClass = isLiveLlm
    ? "border-emerald-300/30 bg-emerald-300/[0.07]"
    : isFallback
      ? "border-amber-300/30 bg-amber-300/[0.07]"
      : "border-slate-400/20 bg-white/[0.04]";
  const provenanceTextClass = isLiveLlm
    ? "text-emerald-200"
    : isFallback
      ? "text-amber-200"
      : "text-slate-200";
  const provenanceTitle = isLiveLlm
    ? "Verified live LLM scenario"
    : isFallback
      ? "Local fallback scenario"
      : "Provider provenance unavailable";

  return (
    <section className="rounded-xl border border-slate-400/20 bg-[#0d1219]/95 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-normal text-violet-300">
            Orchestration and Demo Infra
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">Adaptive feedback loop</h2>
        </div>
        <button
          type="button"
          onClick={onFeedback}
          className="inline-flex items-center gap-2 rounded-lg bg-violet-300 px-3 py-2 text-sm font-bold text-slate-950 transition hover:bg-violet-200"
        >
          <RotateCcw className="h-4 w-4" />
          Generate Feedback
        </button>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-5">
        {[
          ["Red Team Attack", run?.scenario?.attack_family ?? "standby"],
          ["Synthetic Transactions", run ? `${run.total_transactions} tx` : "--"],
          ["Detection Engine", "XGBoost + Isolation Forest"],
          ["AI Investigator", run ? "explanations ready" : "standby"],
          ["Block / Escalate", feedback ? `${Math.round(feedback.detection_rate * 100)}% detected` : "--"],
        ].map(([title, value], index) => (
          <div key={title} className="relative rounded-lg border border-slate-400/20 bg-white/[0.04] p-4">
            {index < 4 ? (
              <ArrowRight className="absolute -right-4 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-slate-400 md:block" />
            ) : null}
            <div className="text-sm font-medium text-slate-400">{title}</div>
            <div className="mt-2 min-h-10 text-sm font-semibold text-white">{value}</div>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className={`rounded-lg border p-4 ${provenanceClass}`}>
          <div className={`flex items-center gap-2 text-sm font-semibold ${provenanceTextClass}`}>
            {isLiveLlm ? <BadgeCheck className="h-4 w-4" /> : <TriangleAlert className="h-4 w-4" />}
            {provenanceTitle}
          </div>
          {generation ? (
            <div className="mt-3 grid gap-1 text-sm leading-6 text-slate-300">
              <p><span className="text-slate-400">Provider:</span> {generation.provider}</p>
              <p><span className="text-slate-400">Model:</span> {generation.model}</p>
              {generation.response_id ? (
                <p className="break-all"><span className="text-slate-400">Response ID:</span> {generation.response_id}</p>
              ) : null}
              {generation.generated_at ? (
                <p><span className="text-slate-400">Generated:</span> {new Date(generation.generated_at).toLocaleString()}</p>
              ) : null}
              {generation.fallback_reason ? (
                <p className="text-amber-100"><span className="text-amber-300">Reason:</span> {generation.fallback_reason}</p>
              ) : null}
            </div>
          ) : (
            <p className="mt-2 text-sm leading-6 text-slate-300">
              This run was created before provenance was added, or the backend has not been restarted with the latest code. Restart FastAPI, then launch a new simulation.
            </p>
          )}
        </div>

        <div className="rounded-lg border border-violet-300/30 bg-violet-300/[0.07] p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-violet-200">
            <GitBranch className="h-4 w-4" />
            Next Red Team scenario
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            {nextScenario
              ? `${nextScenario.mutation_strategy} for round ${nextScenario.attack_round}; evasion strength ${Math.round(nextScenario.evasion_strength * 100)}%.`
              : "Generate feedback after a run to produce mutated parameters for the next round."}
          </p>
        </div>
      </div>
    </section>
  );
}

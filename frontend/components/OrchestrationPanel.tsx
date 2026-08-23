"use client";

import { ArrowRight, GitBranch, RadioTower, RotateCcw } from "lucide-react";
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
        <div className="rounded-lg border border-emerald-300/30 bg-emerald-300/[0.07] p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-200">
            <RadioTower className="h-4 w-4" />
            Resilience fallback - standby
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Standby policy only. If a live LLM call fails, AegisPay switches to deterministic
            scenario generation so the demo still runs end to end.
          </p>
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

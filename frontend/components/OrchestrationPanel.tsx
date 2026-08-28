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
        <div className="rounded border border-white/[0.06] bg-white/[0.02] p-3">
          <div className="flex items-center gap-2 text-xs font-medium text-[#a3a3a3]">
            <RadioTower className="h-3.5 w-3.5" />
            Resilience fallback — standby
          </div>
          <p className="mt-1.5 text-xs leading-5 text-[#737373]">
            Standby policy only. If a live LLM call fails, Sentra switches to deterministic
            scenario generation so the demo still runs end to end.
          </p>
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
    </section>
  );
}

"use client";

import { useMemo } from "react";
import { BarChart3, CheckCircle2, Info, XCircle } from "lucide-react";
import { calculateModelMetrics } from "@/lib/modelMetrics";
import type { Transaction } from "@/lib/types";

function percentage(value: number | null) {
  return value === null ? "--" : `${(value * 100).toFixed(1)}%`;
}

export function ModelEvaluation({ transactions }: { transactions: Transaction[] }) {
  const metrics = useMemo(() => calculateModelMetrics(transactions), [transactions]);
  const hasEvaluation = metrics.evaluated > 0;

  const summary = [
    {
      label: "Precision",
      value: percentage(metrics.precision),
      detail: "Flagged transactions that were fraud",
    },
    {
      label: "Recall",
      value: percentage(metrics.recall),
      detail: "Fraud attempts successfully detected",
    },
    {
      label: "F1 Score",
      value: percentage(metrics.f1Score),
      detail: "Balance of precision and recall",
    },
    {
      label: "False Positive Rate",
      value: percentage(metrics.falsePositiveRate),
      detail: "Legitimate transactions incorrectly flagged",
    },
  ];

  return (
    <section id="model-evaluation" className="panel mt-12 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-purple">
            Model Validation
          </span>
          <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-ink md:text-[22px]">
            Detection performance
          </h2>
          <p className="mt-1 text-sm text-dim">
            Calculated from ground-truth labels in the latest synthetic simulation.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-mute">
          <BarChart3 className="h-3.5 w-3.5" />
          {hasEvaluation ? `${metrics.evaluated} evaluated` : "Awaiting simulation"}
        </span>
      </div>

      <div className="mt-5 grid gap-px overflow-hidden rounded-[10px] border border-white/[0.06] bg-white/[0.06] sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((item) => (
          <article key={item.label} className="bg-raise p-4">
            <div className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-dim">
              {item.label}
            </div>
            <div className="mt-2 font-mono text-2xl font-semibold tabular-nums text-ink">
              {item.value}
            </div>
            <p className="mt-2 text-xs leading-5 text-faint">{item.detail}</p>
          </article>
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.75fr]">
        <div className="rounded-[10px] border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-ink">Confusion matrix</h3>
            <p className="mt-1 text-xs text-dim">Rows are actual labels; columns are model predictions.</p>
          </div>

          <div className="grid grid-cols-[minmax(76px,0.7fr)_1fr_1fr] gap-2 text-center">
            <div />
            <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-dim">Predicted fraud</div>
            <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-dim">Predicted legitimate</div>

            <div className="flex items-center text-left font-mono text-[10px] uppercase tracking-[0.08em] text-dim">Actual fraud</div>
            <MatrixCell label="True positive" value={metrics.truePositives} positive />
            <MatrixCell label="False negative" value={metrics.falseNegatives} />

            <div className="flex items-center text-left font-mono text-[10px] uppercase tracking-[0.08em] text-dim">Actual legitimate</div>
            <MatrixCell label="False positive" value={metrics.falsePositives} />
            <MatrixCell label="True negative" value={metrics.trueNegatives} positive />
          </div>
        </div>

        <div className="rounded-[10px] border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-ink">
            <Info className="h-4 w-4 text-purple" /> Evaluation rule
          </div>
          <p className="mt-3 text-sm leading-6 text-mute">
            <strong className="font-medium text-ink">VERIFY</strong> and{" "}
            <strong className="font-medium text-ink">BLOCK</strong> count as predicted fraud.
            ALLOW and MONITOR count as predicted legitimate.
          </p>
          <div className="mt-4 rounded border border-white/[0.06] bg-black/20 p-3 text-xs leading-5 text-dim">
            These results measure performance on privacy-safe synthetic demo data. They are not a claim of production performance on real cardholder traffic.
          </div>
        </div>
      </div>
    </section>
  );
}

function MatrixCell({ label, value, positive = false }: { label: string; value: number; positive?: boolean }) {
  const Icon = positive ? CheckCircle2 : XCircle;

  return (
    <div className={`rounded border p-3 ${positive ? "border-up/20 bg-up/[0.06]" : "border-down/20 bg-down/[0.06]"}`}>
      <Icon className={`mx-auto h-4 w-4 ${positive ? "text-up" : "text-down"}`} />
      <div className="mt-1 font-mono text-xl font-semibold tabular-nums text-ink">{value}</div>
      <div className="mt-1 text-[10px] text-dim">{label}</div>
    </div>
  );
}

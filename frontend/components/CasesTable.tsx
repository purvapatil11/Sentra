"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { FraudCase } from "@/lib/types";

interface CasesTableProps {
  cases: FraudCase[];
}

function badgeClass(risk: string) {
  if (risk === "CRITICAL") return "border border-rose-300/40 bg-rose-300/15 text-rose-100";
  if (risk === "HIGH") return "border border-amber-300/40 bg-amber-300/15 text-amber-100";
  if (risk === "MEDIUM") return "border border-cyan-300/40 bg-cyan-300/15 text-cyan-100";
  return "border border-emerald-300/40 bg-emerald-300/15 text-emerald-100";
}

export function CasesTable({ cases }: CasesTableProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = useMemo(
    () => cases.find((item) => item.case_id === selectedId) ?? cases[0],
    [cases, selectedId],
  );

  return (
    <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
      <div className="overflow-hidden rounded-lg border border-slate-400/20 bg-[#0d1219]/95">
        <div className="grid grid-cols-[1.1fr_0.7fr_0.8fr_0.8fr] border-b border-slate-400/20 px-4 py-3 text-xs font-bold uppercase tracking-normal text-slate-300">
          <span>Transaction</span>
          <span>Risk</span>
          <span>Decision</span>
          <span>Status</span>
        </div>
        <div className="max-h-[420px] overflow-auto">
          {cases.length ? (
            cases.map((item) => (
              <button
                key={item.case_id}
                type="button"
                onClick={() => setSelectedId(item.case_id)}
                className="grid w-full grid-cols-[1.1fr_0.7fr_0.8fr_0.8fr] items-center border-b border-slate-400/10 px-4 py-3 text-left text-sm transition hover:bg-white/[0.06]"
              >
                <span className="font-medium text-white">{item.transaction_id}</span>
                <span className="text-slate-300">{Math.round(item.risk_score * 100)}/100</span>
                <span className="text-slate-300">{item.decision}</span>
                <span>
                  <b className={`rounded-full px-2.5 py-1 text-xs ${badgeClass(item.risk_level)}`}>
                    {item.risk_level}
                  </b>
                </span>
              </button>
            ))
          ) : (
            <div className="px-4 py-10 text-sm text-slate-300">No cases yet. Launch a Red Team simulation.</div>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-slate-400/20 bg-[#0d1219]/95 p-5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-normal text-cyan-300">
          {selected ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
          Explainable Analysis
        </div>
        {selected ? (
          <>
            <h3 className="mt-5 text-xl font-semibold text-white">{selected.case_id}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">{selected.explanation}</p>
            <div className="mt-5 grid gap-3">
              {selected.top_risk_factors.map((factor) => (
                <div
                  key={factor.feature}
                  className="rounded-lg border border-slate-400/20 bg-white/[0.04] p-3"
                >
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="font-medium text-white">{factor.feature}</span>
                    <span className="text-cyan-200">{String(factor.value)}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-400">{factor.reason}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="mt-5 text-sm text-slate-300">Case explanation will appear here.</p>
        )}
      </div>
    </div>
  );
}

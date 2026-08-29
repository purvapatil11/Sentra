"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { FraudCase } from "@/lib/types";

interface CasesTableProps {
  cases: FraudCase[];
}

function badgeClass(risk: string) {
  if (risk === "CRITICAL") return "border border-[#f87171]/30 bg-[#f87171]/10 text-[#fca5a5]";
  if (risk === "HIGH") return "border border-[#facc15]/30 bg-[#facc15]/10 text-[#fde047]";
  if (risk === "MEDIUM") return "border border-purple/30 bg-purple/10 text-purple";
  return "border border-[#4ade80]/30 bg-[#4ade80]/10 text-[#86efac]";
}

export function CasesTable({ cases }: CasesTableProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = useMemo(
    () => cases.find((item) => item.case_id === selectedId) ?? cases[0],
    [cases, selectedId],
  );

  return (
    <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
      <div className="overflow-hidden rounded-[10px] border border-white/[0.06] bg-raise">
        <div className="grid grid-cols-[1.1fr_0.7fr_0.8fr_0.8fr] border-b border-white/[0.06] px-4 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-mute">
          <span>Transaction</span>
          <span>Risk</span>
          <span>Decision</span>
          <span>Status</span>
        </div>
        <div className="max-h-[400px] overflow-auto">
          {cases.length ? (
            cases.map((item) => (
              <button
                key={item.case_id}
                type="button"
                onClick={() => setSelectedId(item.case_id)}
                className="grid w-full grid-cols-[1.1fr_0.7fr_0.8fr_0.8fr] items-center border-b border-white/[0.04] px-4 py-3 text-left text-[15px] transition hover:bg-white/[0.03]"
              >
                <span className="font-semibold text-ink">{item.transaction_id}</span>
                <span className="font-medium text-mute tabular-nums">{Math.round(item.risk_score * 100)}/100</span>
                <span className="font-medium text-mute">{item.decision}</span>
                <span>
                  <b className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${badgeClass(item.risk_level)}`}>
                    {item.risk_level}
                  </b>
                </span>
              </button>
            ))
          ) : (
            <div className="px-4 py-8 text-sm text-faint">No cases yet. Launch a Red Team simulation.</div>
          )}
        </div>
      </div>

      <div className="rounded-[10px] border border-white/[0.06] bg-raise p-4">
        <div className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-mute">
          {selected ? <AlertTriangle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
          Explainable Analysis
        </div>
        {selected ? (
          <>
            <h3 className="mt-4 text-lg font-semibold text-ink">{selected.case_id}</h3>
            <p className="mt-2 text-[13.5px] leading-6 text-mute">{selected.explanation}</p>
            <div className="mt-4 grid gap-2">
              {selected.top_risk_factors.map((factor) => (
                <div
                  key={factor.feature}
                  className="card p-3"
                >
                  <div className="flex justify-between gap-2 text-[13.5px]">
                    <span className="font-semibold text-ink">{factor.feature}</span>
                    <span className="font-medium text-mute tabular-nums">{String(factor.value)}</span>
                  </div>
                  <p className="mt-1 text-[13px] leading-5 text-faint">{factor.reason}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="mt-4 text-[13.5px] text-faint">Case explanation will appear here.</p>
        )}
      </div>
    </div>
  );
}

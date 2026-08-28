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
  if (risk === "MEDIUM") return "border border-[#a3a3a3]/30 bg-[#a3a3a3]/10 text-[#d4d4d4]";
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
      <div className="overflow-hidden rounded-lg border border-white/[0.06] bg-[#111]">
        <div className="grid grid-cols-[1.1fr_0.7fr_0.8fr_0.8fr] border-b border-white/[0.06] px-4 py-2.5 text-[10px] font-medium uppercase tracking-wide text-[#737373]">
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
                className="grid w-full grid-cols-[1.1fr_0.7fr_0.8fr_0.8fr] items-center border-b border-white/[0.04] px-4 py-2.5 text-left text-sm transition hover:bg-white/[0.03]"
              >
                <span className="font-medium text-[#e5e5e5]">{item.transaction_id}</span>
                <span className="text-[#a3a3a3] tabular-nums">{Math.round(item.risk_score * 100)}/100</span>
                <span className="text-[#a3a3a3]">{item.decision}</span>
                <span>
                  <b className={`rounded px-2 py-0.5 text-[10px] font-medium ${badgeClass(item.risk_level)}`}>
                    {item.risk_level}
                  </b>
                </span>
              </button>
            ))
          ) : (
            <div className="px-4 py-8 text-sm text-[#525252]">No cases yet. Launch a Red Team simulation.</div>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-white/[0.06] bg-[#111] p-4">
        <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-wide text-[#737373]">
          {selected ? <AlertTriangle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
          Explainable Analysis
        </div>
        {selected ? (
          <>
            <h3 className="mt-4 text-base font-medium text-[#e5e5e5]">{selected.case_id}</h3>
            <p className="mt-2 text-xs leading-5 text-[#a3a3a3]">{selected.explanation}</p>
            <div className="mt-4 grid gap-2">
              {selected.top_risk_factors.map((factor) => (
                <div
                  key={factor.feature}
                  className="rounded border border-white/[0.06] bg-white/[0.02] p-3"
                >
                  <div className="flex justify-between gap-2 text-xs">
                    <span className="font-medium text-[#e5e5e5]">{factor.feature}</span>
                    <span className="text-[#a3a3a3] tabular-nums">{String(factor.value)}</span>
                  </div>
                  <p className="mt-1 text-xs text-[#525252]">{factor.reason}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="mt-4 text-xs text-[#525252]">Case explanation will appear here.</p>
        )}
      </div>
    </div>
  );
}

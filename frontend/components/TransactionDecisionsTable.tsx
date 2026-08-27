"use client";

import { useMemo, useState } from "react";
import type { Decision, Transaction } from "@/lib/types";

interface TransactionDecisionsTableProps {
  transactions: Transaction[];
}

const decisions: Decision[] = ["ALLOW", "MONITOR", "VERIFY", "BLOCK"];

const decisionStyles: Record<Decision, string> = {
  ALLOW: "border-emerald-300/40 bg-emerald-300/15 text-emerald-100",
  MONITOR: "border-cyan-300/40 bg-cyan-300/15 text-cyan-100",
  VERIFY: "border-amber-300/40 bg-amber-300/15 text-amber-100",
  BLOCK: "border-rose-300/40 bg-rose-300/15 text-rose-100",
};

export function TransactionDecisionsTable({ transactions }: TransactionDecisionsTableProps) {
  const [filter, setFilter] = useState<Decision | "ALL">("ALL");

  const counts = useMemo(
    () =>
      decisions.reduce<Record<Decision, number>>(
        (result, decision) => ({
          ...result,
          [decision]: transactions.filter((item) => item.score?.decision === decision).length,
        }),
        { ALLOW: 0, MONITOR: 0, VERIFY: 0, BLOCK: 0 },
      ),
    [transactions],
  );

  const visibleTransactions = useMemo(
    () =>
      transactions.filter(
        (item) => item.score && (filter === "ALL" || item.score.decision === filter),
      ),
    [filter, transactions],
  );

  const unscoredCount = transactions.filter((item) => !item.score).length;

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {decisions.map((decision) => (
          <button
            key={decision}
            type="button"
            onClick={() => setFilter((current) => (current === decision ? "ALL" : decision))}
            className={`rounded-lg border p-4 text-left transition ${decisionStyles[decision]} ${
              filter === decision ? "ring-2 ring-white/40" : "hover:bg-white/10"
            }`}
          >
            <span className="text-xs font-bold tracking-wide">{decision}</span>
            <strong className="mt-2 block text-2xl">{counts[decision]}</strong>
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-slate-400/20 bg-[#0d1219]/95">
        <div className="grid grid-cols-[1.2fr_0.8fr_0.7fr_0.7fr_0.7fr] border-b border-slate-400/20 px-4 py-3 text-xs font-bold uppercase text-slate-300">
          <span>Transaction</span>
          <span>Amount</span>
          <span>Risk</span>
          <span>Decision</span>
          <span>Truth</span>
        </div>
        <div className="max-h-[440px] overflow-auto">
          {visibleTransactions.length ? (
            visibleTransactions.map((item) => {
              const score = item.score!;
              return (
                <div
                  key={item.transaction_id}
                  className="grid grid-cols-[1.2fr_0.8fr_0.7fr_0.7fr_0.7fr] items-center border-b border-slate-400/10 px-4 py-3 text-sm"
                >
                  <span className="font-medium text-white">{item.transaction_id}</span>
                  <span className="text-slate-300">Rs {item.amount.toLocaleString("en-IN")}</span>
                  <span className="text-slate-300">{Math.round(score.risk_score * 100)}/100</span>
                  <span>
                    <b className={`rounded-full border px-2.5 py-1 text-xs ${decisionStyles[score.decision]}`}>
                      {score.decision}
                    </b>
                  </span>
                  <span className={item.label ? "text-rose-200" : "text-emerald-200"}>
                    {item.label ? "Fraud" : "Legitimate"}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="px-4 py-10 text-sm text-slate-300">
              No {filter === "ALL" ? "scored transactions" : filter.toLowerCase() + " decisions"} in this run.
            </div>
          )}
        </div>
      </div>

      {unscoredCount > 0 ? (
        <p className="mt-3 text-sm text-amber-200">
          {unscoredCount} transaction{unscoredCount === 1 ? "" : "s"} came from a legacy or unscored run.
          Launch a new simulation to populate decisions.
        </p>
      ) : null}
    </div>
  );
}

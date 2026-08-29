"use client";

import { useMemo, useState } from "react";
import type { Decision, Transaction } from "@/lib/types";

interface TransactionDecisionsTableProps {
  transactions: Transaction[];
}

const decisions: Decision[] = ["ALLOW", "MONITOR", "VERIFY", "BLOCK"];

const decisionStyles: Record<Decision, string> = {
  ALLOW: "border-up/40 bg-up/15 text-up",
  MONITOR: "border-purple/40 bg-purple/15 text-purple",
  VERIFY: "border-[#fbbf24]/40 bg-[#fbbf24]/15 text-[#fbbf24]",
  BLOCK: "border-down/40 bg-down/15 text-down",
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
            className={`rounded-[10px] border p-4 text-left transition ${decisionStyles[decision]} ${
              filter === decision ? "ring-2 ring-white/40" : "hover:bg-white/10"
            }`}
          >
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.1em]">{decision}</span>
            <strong className="mt-2 block font-mono text-2xl tabular-nums">{counts[decision]}</strong>
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-hidden rounded-[10px] border border-white/[0.09] bg-raise">
        <div className="grid grid-cols-[1.2fr_0.8fr_0.7fr_0.7fr_0.7fr] border-b border-white/[0.09] px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-dim">
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
                  className="grid grid-cols-[1.2fr_0.8fr_0.7fr_0.7fr_0.7fr] items-center border-b border-white/[0.06] px-4 py-3 text-sm"
                >
                  <span className="font-medium text-ink">{item.transaction_id}</span>
                  <span className="text-mute">{item.amount.toLocaleString("en-IN")}</span>
                  <span className="text-mute">{Math.round(score.risk_score * 100)}/100</span>
                  <span>
                    <b className={`rounded-full border px-2.5 py-1 text-xs ${decisionStyles[score.decision]}`}>
                      {score.decision}
                    </b>
                  </span>
                  <span className={item.label ? "text-down" : "text-up"}>
                    {item.label ? "Fraud" : "Legitimate"}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="px-4 py-10 text-sm text-mute">
              No {filter === "ALL" ? "scored transactions" : filter.toLowerCase() + " decisions"} in this run.
            </div>
          )}
        </div>
      </div>

      {unscoredCount > 0 ? (
        <p className="mt-3 text-sm text-[#fbbf24]">
          {unscoredCount} transaction{unscoredCount === 1 ? "" : "s"} came from a legacy or unscored run.
          Launch a new simulation to populate decisions.
        </p>
      ) : null}
    </div>
  );
}

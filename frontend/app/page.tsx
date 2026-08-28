"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BadgeIndianRupee,
  Brain,
  ShieldCheck,
  ShieldX,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import { AttackLab } from "@/components/AttackLab";
import { CasesTable } from "@/components/CasesTable";
import {
  DetectionRateChart,
  FraudDistributionChart,
} from "@/components/DashboardCharts";
import { MetricCard } from "@/components/MetricCard";
import { OrchestrationPanel } from "@/components/OrchestrationPanel";
import { SignalTicker } from "@/components/SignalTicker";
import { Sidebar } from "@/components/Sidebar";
import { SOCConsole } from "@/components/SOCConsole";

import {
  generateCustomers,
  generateFeedback,
  getCases,
  getTransactions,
  launchAttack,
  loadDashboardState,
  type LaunchAttackInput,
} from "@/lib/api";
import type { DashboardState, SimulationRun } from "@/lib/types";

const initialState: DashboardState = {
  customers: [],
  runs: [],
  transactions: [],
  cases: [],
  feedback: null,
  nextScenario: null,
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN").format(Math.round(value));
}

export default function Home() {
  const [state, setState] = useState<DashboardState>(initialState);
  const [loading, setLoading] = useState(true);

  const latestRun = state.runs[0] ?? null;

  const metrics = useMemo(() => {
    const transactions = latestRun?.total_transactions ?? state.transactions.length;
    const blocked = state.cases.filter((item) => item.decision === "BLOCK" || item.decision === "VERIFY").length;
    const threats = state.cases.filter((item) => item.risk_level === "HIGH" || item.risk_level === "CRITICAL").length;
    const lossPrevented = state.cases.reduce((sum, item) => sum + item.risk_score * 72000, 0);

    return {
      transactions,
      blocked,
      threats,
      lossPrevented,
      detection: state.feedback ? `${Math.round(state.feedback.detection_rate * 100)}%` : "--",
    };
  }, [latestRun, state.cases, state.feedback, state.transactions.length]);

  async function refresh() {
    const snapshot = await loadDashboardState();
    setState((current) => ({
      ...snapshot,
      feedback: current.feedback,
      nextScenario: current.nextScenario,
    }));
  }

  async function onLaunch(input: LaunchAttackInput): Promise<SimulationRun> {
    const run = await launchAttack(input);
    const [transactions, cases] = await Promise.all([getTransactions(), getCases()]);
    const snapshot = await loadDashboardState();

    setState((current) => ({
      ...current,
      ...snapshot,
      transactions: transactions.transactions,
      cases: cases.cases,
      feedback: null,
      nextScenario: null,
    }));

    toast.success("Attack launched. Blue Team analysis completed.");
    return run;
  }

  async function onFeedback() {
    const result = await generateFeedback();
    setState((current) => ({
      ...current,
      feedback: result.feedback,
      nextScenario: result.next_scenario,
    }));
    toast.success(`Adaptive mutation ready: ${result.feedback.recommended_mutation}`);
  }

  async function seedCustomers() {
    const result = await generateCustomers(100);
    const snapshot = await loadDashboardState();
    setState((current) => ({
      ...current,
      ...snapshot,
    }));
    toast.success(`${result.created} customers generated`);
  }

  useEffect(() => {
    loadDashboardState()
      .then(setState)
      .catch(() => {
        toast.error("FastAPI backend is not reachable on port 8000");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="relative z-10 flex min-h-screen gap-4 p-4">
      <Sidebar />

      <main className="min-w-0 flex-1">
        <SignalTicker />

        <section id="dashboard" className="flex min-h-[200px] flex-col items-start justify-between gap-6 py-8 xl:flex-row">
          <div className="w-full">
            <h1 className="mx-auto mt-16 mb-8 text-center text-5xl font-semibold tracking-tight text-[#e5e5e5] md:text-6xl whitespace-nowrap">
              Smart defence for every transaction
            </h1>
            <p className="mx-auto mb-16 mt-3 max-w-xl text-center text-base font-semibold leading-7 text-[#a3a3a3]">
              Red Team attacks, synthetic fraud streams, Blue Team model scoring,
              explainable cases, and adaptive feedback.
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={seedCustomers}
              className="rounded border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-[#a3a3a3] transition hover:bg-white/[0.08] hover:text-[#e5e5e5]"
            >
              Generate Customers
            </button>
            <button
              type="button"
              onClick={refresh}
              className="rounded bg-[#e5e5e5] px-3 py-2 text-sm font-medium text-[#0a0a0a] transition hover:bg-[#d4d4d4]"
            >
              Refresh
            </button>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard
            label="Transactions Analyzed"
            value={loading ? "--" : formatNumber(metrics.transactions)}
            detail="Latest simulation stream"
            tone="cyan"
            icon={Activity}
          />
          <MetricCard
            label="Fraud Attempts Blocked"
            value={loading ? "--" : formatNumber(metrics.blocked)}
            detail="VERIFY and BLOCK decisions"
            tone="green"
            icon={ShieldCheck}
          />
          <MetricCard
            label="Potential Loss Prevented"
            value={`Rs ${formatNumber(metrics.lossPrevented)}`}
            detail="Estimated demo exposure"
            tone="amber"
            icon={BadgeIndianRupee}
          />
          <MetricCard
            label="Detection Accuracy"
            value={metrics.detection}
            detail="From feedback loop"
            tone="cyan"
            icon={Target}
          />
          <MetricCard
            label="Active Threats"
            value={loading ? "--" : formatNumber(metrics.threats)}
            detail="High and critical cases"
            tone="red"
            icon={ShieldX}
          />
        </section>

        <section className="mt-4">
          <SOCConsole />
        </section>

        <section className="mt-4 grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
          <article className="panel p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wide text-[#737373]">Main Dashboard</p>
                <h2 className="mt-1 text-sm font-medium text-[#e5e5e5]">Detection rate chart</h2>
              </div>
              <span className="rounded border border-[#4ade80]/20 bg-[#4ade80]/5 px-2 py-0.5 text-[10px] font-medium text-[#4ade80]">
                LIVE
              </span>
            </div>
            <DetectionRateChart
              cases={state.cases}
              transactions={state.transactions}
              feedback={state.feedback}
            />
          </article>

          <article className="panel p-4">
            <div className="mb-4">
              <p className="text-[10px] font-medium uppercase tracking-wide text-[#737373]">
                Fraud Category Distribution
              </p>
              <h2 className="mt-1 text-sm font-medium text-[#e5e5e5]">Synthetic traffic mix</h2>
            </div>
            <FraudDistributionChart transactions={state.transactions} />
          </article>
        </section>

        <section id="attack-lab" className="mt-4 panel p-4">
          <div className="mb-4 flex items-center gap-2">
            <Brain className="h-4 w-4 text-[#737373]" />
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wide text-[#737373]">Red Team Lab</p>
              <h2 className="mt-1 text-sm font-medium text-[#e5e5e5]">
                Pick attack type, volume, fraud percentage, and launch
              </h2>
            </div>
          </div>
          <AttackLab onLaunch={onLaunch} />
        </section>

        <section id="orchestration" className="mt-4">
          <OrchestrationPanel
            run={latestRun}
            feedback={state.feedback}
            nextScenario={state.nextScenario}
            onFeedback={onFeedback}
          />
        </section>

        <section id="cases" className="mt-4 panel p-4">
          <div className="mb-4">
            <p className="text-[10px] font-medium uppercase tracking-wide text-[#737373]">Blue Team Cases</p>
            <h2 className="mt-1 text-sm font-medium text-[#e5e5e5]">
              Transaction table, risk score, decision, and explanation text
            </h2>
          </div>
          <CasesTable cases={state.cases} />
        </section>
      </main>
    </div>
  );
}

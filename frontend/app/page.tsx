"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
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
import { ThemeToggle } from "@/components/ThemeToggle";
import { TransactionDecisionsTable } from "@/components/TransactionDecisionsTable";
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
    const blocked = state.transactions.filter((item) => item.score?.decision === "BLOCK").length;
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
    <div className="relative z-10 flex min-h-screen gap-5 p-5">
      <Sidebar />

      <main className="min-w-0 flex-1">
        <SignalTicker />

        <section id="dashboard" className="editorial-hero flex min-h-[330px] flex-col items-start justify-between gap-8 py-10 xl:flex-row">
          <div>
            <div className="section-marker" data-index="00">
              Payment Defense Command Center
            </div>
            <h1 className="mt-5 max-w-4xl text-4xl font-black uppercase leading-[1.02] text-white md:text-6xl">
              Detect. Simulate. Defend against AI-powered payment fraud.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
              A cinematic but enterprise-grade command center for Red Team attacks,
              synthetic fraud streams, Blue Team model scoring, explainable cases, and
              adaptive feedback.
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap gap-3 pt-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={seedCustomers}
              className="rounded-lg border border-slate-400/30 bg-slate-800/70 px-4 py-3 text-sm font-semibold text-white transition hover:border-cyan-300/60 hover:bg-slate-700/70"
            >
              Generate Customers
            </button>
            <button
              type="button"
              onClick={refresh}
              className="rounded-lg bg-cyan-400 px-4 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-300"
            >
              Refresh Intel
            </button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
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
            detail="BLOCK decisions only"
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

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45 }}
          className="mt-5"
        >
          <SOCConsole />
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.12 }}
          className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_0.8fr]"
        >
          <motion.article
            whileHover={{ y: -2 }}
            className="panel p-5"
          >
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <div className="section-marker text-cyan-300" data-index="01">Main Dashboard</div>
                <h2 className="mt-2 text-xl font-semibold text-white">Detection rate chart</h2>
              </div>
              <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                LIVE
              </span>
            </div>
            <DetectionRateChart
              cases={state.cases}
              transactions={state.transactions}
              feedback={state.feedback}
            />
          </motion.article>

          <motion.article whileHover={{ y: -2 }} className="panel p-5">
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-normal text-amber-300">
                Fraud Category Distribution
              </p>
              <h2 className="mt-2 text-xl font-semibold text-white">Synthetic traffic mix</h2>
            </div>
            <FraudDistributionChart transactions={state.transactions} />
          </motion.article>
        </motion.section>

        <motion.section
          id="attack-lab"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          className="mt-5 panel p-5"
        >
          <div className="mb-5 flex items-center gap-3">
            <Brain className="h-5 w-5 text-rose-300" />
            <div>
              <div className="section-marker text-rose-300" data-index="02">Red Team Lab</div>
              <h2 className="mt-2 text-xl font-semibold text-white">
                Pick attack type, volume, fraud percentage, and launch
              </h2>
            </div>
          </div>
          <AttackLab onLaunch={onLaunch} />
        </motion.section>

        <motion.section
          id="orchestration"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          className="mt-5"
        >
          <OrchestrationPanel
            run={latestRun}
            feedback={state.feedback}
            nextScenario={state.nextScenario}
            onFeedback={onFeedback}
          />
        </motion.section>

        <motion.section
          id="transactions"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          className="mt-5 panel p-5"
        >
          <div className="mb-5">
            <div className="section-marker text-emerald-300" data-index="03">Decision Ledger</div>
            <h2 className="mt-2 text-xl font-semibold text-white">
              Every scored transaction and policy decision
            </h2>
          </div>
          <TransactionDecisionsTable transactions={state.transactions} />
        </motion.section>

        <motion.section
          id="cases"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          className="mt-5 panel p-5"
        >
          <div className="mb-5">
            <div className="section-marker text-cyan-300" data-index="04">Blue Team Cases</div>
            <h2 className="mt-2 text-xl font-semibold text-white">
              Flagged VERIFY and BLOCK decisions requiring analyst attention
            </h2>
          </div>
          <CasesTable cases={state.cases} />
        </motion.section>
      </main>
    </div>
  );
}

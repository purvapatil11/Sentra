"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Play, ShieldAlert } from "lucide-react";
import type { AttackFamily, SimulationRun } from "@/lib/types";

interface AttackLabProps {
  onLaunch: (input: {
    attack_family: AttackFamily;
    volume: number;
    fraud_ratio: number;
    score_all: boolean;
  }) => Promise<SimulationRun>;
}

const scenarios: Array<{
  id: AttackFamily;
  name: string;
  description: string;
  severity: string;
  volume: string;
}> = [
  {
    id: "synthetic_identity",
    name: "Synthetic Identity Fraud",
    description: "New profile matures normally, then ramps up transfer behavior.",
    severity: "High",
    volume: "1.8k tx",
  },
  {
    id: "account_takeover",
    name: "Account Takeover",
    description: "Trusted customer account is accessed from low-trust infrastructure.",
    severity: "Critical",
    volume: "1.2k tx",
  },
  {
    id: "ai_social_engineering",
    name: "AI-Assisted Social Engineering",
    description: "Personalized persuasion causes the real user to authorize risky payments.",
    severity: "Critical",
    volume: "900 tx",
  },
];

const sequence = [
  "Initializing adversarial simulation...",
  "Generating fraud persona... complete",
  "Generating transaction behavior... complete",
  "Injecting behavioral anomalies... complete",
  "Launching attack...",
  "Blue Team analysis started automatically.",
];

export function AttackLab({ onLaunch }: AttackLabProps) {
  const [attackFamily, setAttackFamily] = useState<AttackFamily>("ai_social_engineering");
  const [volume, setVolume] = useState(100);
  const [fraudRatio, setFraudRatio] = useState(0.2);
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState<string[]>([]);

  async function launch() {
    setRunning(true);
    setSteps([]);

    for (const step of sequence) {
      setSteps((items) => [...items, step]);
      await new Promise((resolve) => window.setTimeout(resolve, 260));
    }

    await onLaunch({
      attack_family: attackFamily,
      volume,
      fraud_ratio: fraudRatio,
      score_all: true,
    });

    setRunning(false);
  }

  return (
    <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
      <div className="grid gap-4 md:grid-cols-3">
        {scenarios.map((scenario) => (
          <motion.button
            key={scenario.id}
            whileHover={{ y: -4 }}
            onClick={() => setAttackFamily(scenario.id)}
            className={`rounded-lg border p-5 text-left transition ${
              attackFamily === scenario.id
                ? "border-cyan-300/40 bg-cyan-300/[0.08]"
                : "border-white/10 bg-white/[0.025] hover:border-white/20"
            }`}
          >
            <div className="mb-5 flex items-center justify-between">
              <ShieldAlert className="h-5 w-5 text-rose-300" />
              <span className="rounded-full bg-rose-300/10 px-2.5 py-1 text-xs font-semibold text-rose-200">
                {scenario.severity}
              </span>
            </div>
            <h3 className="text-base font-semibold text-white">{scenario.name}</h3>
            <p className="mt-2 min-h-16 text-sm leading-6 text-slate-300">{scenario.description}</p>
            <div className="mt-4 text-sm font-medium text-slate-400">{scenario.volume}</div>
          </motion.button>
        ))}
      </div>

      <div className="rounded-lg border border-slate-400/20 bg-[#0d1219]/95 p-5">
        <div className="text-xs font-bold uppercase tracking-normal text-rose-300">
          Red Team Control
        </div>
        <div className="mt-5 grid gap-4">
          <label className="grid gap-2 text-sm text-slate-300">
            Attack type
            <select
              value={attackFamily}
              onChange={(event) => setAttackFamily(event.target.value as AttackFamily)}
              className="rounded-lg border border-slate-400/30 bg-slate-900 px-3 py-3 text-white outline-none"
            >
              <option value="ai_social_engineering">AI Social Engineering</option>
              <option value="account_takeover">Account Takeover</option>
              <option value="synthetic_identity">Synthetic Identity</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm text-slate-300">
            Volume
            <input
              value={volume}
              min={1}
              max={5000}
              type="number"
              onChange={(event) => setVolume(Number(event.target.value))}
              className="rounded-lg border border-slate-400/30 bg-slate-900 px-3 py-3 text-white outline-none"
            />
          </label>
          <label className="grid gap-2 text-sm text-slate-300">
            Fraud ratio: {Math.round(fraudRatio * 100)}%
            <input
              value={fraudRatio}
              min={0}
              max={0.8}
              step={0.01}
              type="range"
              onChange={(event) => setFraudRatio(Number(event.target.value))}
              className="accent-cyan-300"
            />
          </label>
          <button
            type="button"
            onClick={launch}
            disabled={running}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-rose-400 px-4 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-rose-500/20 transition hover:bg-rose-300 disabled:opacity-60"
          >
            <Play className="h-4 w-4" />
            {running ? "Launching..." : "Launch Attack"}
          </button>
        </div>

        <div className="mt-5 grid gap-2">
          {steps.map((step) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-slate-400/20 bg-white/[0.04] px-3 py-2 text-sm text-slate-200"
            >
              {step}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

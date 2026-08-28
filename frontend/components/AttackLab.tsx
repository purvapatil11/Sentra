"use client";

import { useState } from "react";
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
    <section className="grid gap-4 xl:grid-cols-[1fr_320px]">
      <div className="grid gap-3 md:grid-cols-3">
        {scenarios.map((scenario) => (
          <button
            key={scenario.id}
            onClick={() => setAttackFamily(scenario.id)}
            className={`rounded-lg border p-4 text-left transition ${
              attackFamily === scenario.id
                ? "border-white/[0.15] bg-white/[0.06]"
                : "border-white/[0.06] bg-transparent hover:border-white/[0.1]"
            }`}
          >
            <div className="mb-4 flex items-center justify-between">
              <ShieldAlert className="h-4 w-4 text-[#737373]" />
              <span className="rounded border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#a3a3a3]">
                {scenario.severity}
              </span>
            </div>
            <h3 className="text-sm font-medium text-[#e5e5e5]">{scenario.name}</h3>
            <p className="mt-1.5 text-xs leading-5 text-[#737373]">{scenario.description}</p>
            <div className="mt-3 text-xs text-[#525252]">{scenario.volume}</div>
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-white/[0.06] bg-[#111] p-4">
        <div className="text-[10px] font-medium uppercase tracking-wide text-[#737373]">
          Red Team Control
        </div>
        <div className="mt-4 grid gap-3">
          <label className="grid gap-1.5 text-xs text-[#a3a3a3]">
            Attack type
            <select
              value={attackFamily}
              onChange={(event) => setAttackFamily(event.target.value as AttackFamily)}
              className="rounded border border-white/[0.08] bg-[#0a0a0a] px-3 py-2 text-sm text-[#e5e5e5] outline-none"
            >
              <option value="ai_social_engineering">AI Social Engineering</option>
              <option value="account_takeover">Account Takeover</option>
              <option value="synthetic_identity">Synthetic Identity</option>
            </select>
          </label>
          <label className="grid gap-1.5 text-xs text-[#a3a3a3]">
            Volume
            <input
              value={volume}
              min={1}
              max={5000}
              type="number"
              onChange={(event) => setVolume(Number(event.target.value))}
              className="rounded border border-white/[0.08] bg-[#0a0a0a] px-3 py-2 text-sm text-[#e5e5e5] outline-none"
            />
          </label>
          <label className="grid gap-1.5 text-xs text-[#a3a3a3]">
            Fraud ratio: {Math.round(fraudRatio * 100)}%
            <input
              value={fraudRatio}
              min={0}
              max={0.8}
              step={0.01}
              type="range"
              onChange={(event) => setFraudRatio(Number(event.target.value))}
              className="accent-[#a3a3a3]"
            />
          </label>
          <button
            type="button"
            onClick={launch}
            disabled={running}
            className="inline-flex items-center justify-center gap-2 rounded bg-[#e5e5e5] px-4 py-2 text-sm font-medium text-[#0a0a0a] transition hover:bg-[#d4d4d4] disabled:opacity-50"
          >
            <Play className="h-3.5 w-3.5" />
            {running ? "Launching..." : "Launch Attack"}
          </button>
        </div>

        <div className="mt-4 grid gap-1.5">
          {steps.map((step) => (
            <div
              key={step}
              className="rounded border border-white/[0.04] bg-white/[0.02] px-2.5 py-1.5 text-xs text-[#a3a3a3]"
            >
              {step}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

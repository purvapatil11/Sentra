"use client";

import { useState } from "react";
import { Crosshair, Play } from "lucide-react";
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

export function AttackLab({ onLaunch }: AttackLabProps) {
  const [attackFamily, setAttackFamily] = useState<AttackFamily>("ai_social_engineering");
  const [volume, setVolume] = useState(100);
  const [fraudRatio, setFraudRatio] = useState(0.2);
  const [running, setRunning] = useState(false);

  async function launch() {
    setRunning(true);

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
            className={`rounded-[10px] border p-4 text-left transition ${
              attackFamily === scenario.id
                ? "border-purple/40 bg-purple/[0.08]"
                : "border-white/[0.06] bg-transparent hover:border-white/[0.12] hover:bg-white/[0.02]"
            }`}
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="grid h-8 w-8 place-items-center rounded-[8px] bg-down/15 text-down">
                <Crosshair className="h-4.5 w-4.5" />
              </span>
              <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-mute">
                {scenario.severity}
              </span>
            </div>
            <h3 className="text-[17px] leading-tight font-semibold text-ink">{scenario.name}</h3>
            <p className="mt-2 text-[13.5px] leading-6 text-mute">{scenario.description}</p>
            <div className="mt-3 font-mono text-[13px] font-semibold text-faint">{scenario.volume}</div>
          </button>
        ))}
      </div>

      <div className="rounded-[10px] border border-white/[0.06] bg-raise p-4">
        <div className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-purple">
          Red Team Control
        </div>
        <div className="mt-4 grid gap-3">
          <label className="grid gap-1.5 text-[13px] font-medium text-ink">
            Attack type
            <select
              value={attackFamily}
              onChange={(event) => setAttackFamily(event.target.value as AttackFamily)}
              className="rounded border border-white/[0.08] bg-bg px-3 py-2.5 text-[15px] font-medium text-ink outline-none"
            >
              <option value="ai_social_engineering">AI Social Engineering</option>
              <option value="account_takeover">Account Takeover</option>
              <option value="synthetic_identity">Synthetic Identity</option>
            </select>
          </label>
          <label className="grid gap-1.5 text-[13px] font-medium text-ink">
            Volume
            <input
              value={volume}
              min={1}
              max={5000}
              type="number"
              onChange={(event) => setVolume(Number(event.target.value))}
              className="rounded border border-white/[0.08] bg-bg px-3 py-2.5 text-[15px] font-medium text-ink outline-none"
            />
          </label>
          <label className="grid gap-1.5 text-[13px] font-medium text-ink">
            Fraud ratio: {Math.round(fraudRatio * 100)}%
            <input
              value={fraudRatio}
              min={0}
              max={0.8}
              step={0.01}
              type="range"
              onChange={(event) => setFraudRatio(Number(event.target.value))}
              className="accent-purple"
            />
          </label>
          <button
            type="button"
            onClick={launch}
            disabled={running}
            className="inline-flex items-center justify-center gap-2 rounded bg-ink px-4 py-2.5 text-[15px] font-semibold text-bg transition hover:bg-[#e6e8ea] disabled:opacity-50"
          >
            <Play className="h-4 w-4" />
            {running ? "Launching..." : "Launch Attack"}
          </button>
        </div>

        <div className="mt-4">
          {running ? (
            <div className="flex items-center gap-2 rounded border border-purple/25 bg-purple/[0.06] px-3 py-2.5">
              <span className="h-2 w-2 animate-pulse rounded-full bg-purple" />
              <span className="text-[13px] font-medium text-purple">Launching attack…</span>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

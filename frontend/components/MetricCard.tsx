"use client";

import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  detail: string;
  tone: "cyan" | "green" | "amber" | "red" | "violet";
  icon: LucideIcon;
}

const toneClass = {
  cyan: "text-[#d4d4d4]",
  green: "text-[#d4d4d4]",
  amber: "text-[#d4d4d4]",
  red: "text-[#d4d4d4]",
  violet: "text-[#d4d4d4]",
};

const dotClass = {
  cyan: "bg-[#a3a3a3]",
  green: "bg-[#4ade80]",
  amber: "bg-[#facc15]",
  red: "bg-[#f87171]",
  violet: "bg-[#c084fc]",
};

export function MetricCard({ label, value, detail, tone, icon: Icon }: MetricCardProps) {
  return (
    <article className="rounded-lg border border-white/[0.06] bg-[#111] p-4">
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-medium text-[#737373] uppercase tracking-wide">{label}</span>
        <span className={`h-2 w-2 rounded-full ${dotClass[tone]}`} />
      </div>
      <div className="mt-4 text-2xl font-semibold text-[#e5e5e5] tabular-nums">
        {value}
      </div>
      <p className="mt-1.5 text-xs text-[#525252]">{detail}</p>
    </article>
  );
}

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
  cyan: "text-purple",
  green: "text-up",
  amber: "text-[#fbbf24]",
  red: "text-down",
  violet: "text-purple",
};

export function MetricCard({ label, value, detail, tone, icon: Icon }: MetricCardProps) {
  return (
    <article className="group flex h-full flex-col bg-raise p-5 transition-colors hover:bg-[#101215]">
      <div className="flex items-start justify-between gap-3">
        <span className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-dim">
          {label}
        </span>
        <Icon aria-hidden="true" className={`h-4 w-4 transition-opacity ${toneClass[tone]}`} />
      </div>
      <div className="mt-3 font-mono text-[26px] leading-tight font-semibold text-ink tabular-nums">
        {value}
      </div>
      <p className="mt-auto pt-2.5 text-xs text-faint">{detail}</p>
    </article>
  );
}

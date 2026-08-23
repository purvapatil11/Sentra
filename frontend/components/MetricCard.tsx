"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  detail: string;
  tone: "cyan" | "green" | "amber" | "red" | "violet";
  icon: LucideIcon;
}

const toneClass = {
  cyan: "text-cyan-300 shadow-cyan-500/10",
  green: "text-emerald-300 shadow-emerald-500/10",
  amber: "text-amber-300 shadow-amber-500/10",
  red: "text-rose-300 shadow-rose-500/10",
  violet: "text-violet-300 shadow-violet-500/10",
};

export function MetricCard({ label, value, detail, tone, icon: Icon }: MetricCardProps) {
  return (
    <motion.article
      whileHover={{ y: -3 }}
      className="group rounded-lg border border-slate-400/20 bg-[#0d1219]/95 p-5 shadow-2xl shadow-black/25 transition-colors hover:border-cyan-300/50"
    >
      <div className="flex items-start justify-between gap-4">
        <span className="text-sm font-semibold text-slate-300">{label}</span>
        <Icon className={`h-4 w-4 ${toneClass[tone]}`} />
      </div>
      <div className={`mt-5 text-3xl font-bold ${toneClass[tone]}`}>
        {value}
      </div>
      <p className="mt-2 text-sm text-slate-400">{detail}</p>
    </motion.article>
  );
}

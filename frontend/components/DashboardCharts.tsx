"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Feedback, FraudCase, Transaction } from "@/lib/types";

interface DashboardChartsProps {
  cases: FraudCase[];
  transactions: Transaction[];
  feedback: Feedback | null;
}

export function DetectionRateChart({ cases, feedback }: DashboardChartsProps) {
  const chartData = cases.slice(0, 18).map((item, index) => ({
    name: `T${index + 1}`,
    risk: Math.round(item.risk_score * 100),
    fraud: Math.round(item.xgboost_score * 100),
  }));

  const data = chartData.length
    ? chartData
    : [
        { name: "T1", risk: 18, fraud: 12 },
        { name: "T2", risk: 32, fraud: 24 },
        { name: "T3", risk: 46, fraud: 39 },
        { name: "T4", risk: 71, fraud: 66 },
        { name: "T5", risk: 88, fraud: 92 },
      ];

  return (
    <div className="mt-6">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.1em] text-dim">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-purple" />
            Risk
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-faint" />
            Fraud
          </span>
        </div>
        <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-faint">
          Detection {feedback ? `${Math.round(feedback.detection_rate * 100)}%` : "--"}
        </span>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="riskGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
            <XAxis dataKey="name" stroke="var(--chart-axis)" tickLine={false} axisLine={false} />
            <YAxis stroke="var(--chart-axis)" tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                background: "#131519",
                border: "1px solid rgba(255,255,255,0.09)",
                borderRadius: 10,
                color: "#f7f8f8",
                fontSize: 12,
              }}
            />
            <Area
              type="monotone"
              dataKey="risk"
              stroke="#a78bfa"
              strokeWidth={2}
              fill="url(#riskGradient)"
            />
            <Area
              type="monotone"
              dataKey="fraud"
              stroke="#5c6067"
              strokeWidth={1.5}
              fill="transparent"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.1em] text-faint">
        Risk and fraud probability
      </p>
    </div>
  );
}

export function FraudDistributionChart({ transactions }: { transactions: Transaction[] }) {
  const counts = transactions.reduce<Record<string, number>>((acc, item) => {
    const key = item.attack_type ?? "legitimate";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const data = Object.entries(counts).length
    ? Object.entries(counts).map(([name, count]) => ({ name: name.replaceAll("_", " "), count }))
    : [
        { name: "legitimate", count: 74 },
        { name: "ai social engineering", count: 14 },
        { name: "account takeover", count: 12 },
      ];

  const colors = ["#a78bfa", "#8a8f98", "#7c5cf0", "#5c6067", "#4a4d55"];

  return (
    <div className="mt-6 h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 18 }}>
          <CartesianGrid stroke="var(--chart-grid)" horizontal={false} />
          <XAxis type="number" stroke="var(--chart-axis)" tickLine={false} axisLine={false} />
          <YAxis
            type="category"
            dataKey="name"
            width={140}
            stroke="var(--chart-axis)"
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "#131519",
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: 10,
              color: "#f7f8f8",
              fontSize: 12,
            }}
          />
          <Bar dataKey="count" radius={[0, 3, 3, 0]}>
            {data.map((_, index) => (
              <Cell key={index} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

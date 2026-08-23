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
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="riskGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.55} />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
          <XAxis dataKey="name" stroke="var(--chart-axis)" tickLine={false} axisLine={false} />
          <YAxis stroke="var(--chart-axis)" tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              background: "var(--surface-raised)",
              border: "1px solid rgba(203,213,225,0.3)",
              borderRadius: 8,
              color: "var(--foreground)",
            }}
          />
          <Area
            type="monotone"
            dataKey="risk"
            stroke="#22d3ee"
            strokeWidth={2}
            fill="url(#riskGradient)"
          />
          <Area
            type="monotone"
            dataKey="fraud"
            stroke="#fb7185"
            strokeWidth={2}
            fill="transparent"
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="mt-2 flex justify-between text-sm font-medium text-slate-400">
        <span>Risk and fraud probability</span>
        <span>Detection {feedback ? `${Math.round(feedback.detection_rate * 100)}%` : "--"}</span>
      </div>
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

  const colors = ["#34d399", "#fb7185", "#f59e0b", "#22d3ee", "#a78bfa"];

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 18 }}>
          <CartesianGrid stroke="var(--chart-grid)" horizontal={false} />
          <XAxis type="number" stroke="var(--chart-axis)" tickLine={false} axisLine={false} />
          <YAxis
            type="category"
            dataKey="name"
            width={120}
            stroke="var(--chart-axis)"
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "var(--surface-raised)",
              border: "1px solid rgba(203,213,225,0.3)",
              borderRadius: 8,
              color: "var(--foreground)",
            }}
          />
          <Bar dataKey="count" radius={[0, 8, 8, 0]}>
            {data.map((_, index) => (
              <Cell key={index} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

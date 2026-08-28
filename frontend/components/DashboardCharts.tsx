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
              <stop offset="0%" stopColor="#a3a3a3" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#a3a3a3" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
          <XAxis dataKey="name" stroke="var(--chart-axis)" tickLine={false} axisLine={false} />
          <YAxis stroke="var(--chart-axis)" tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              background: "#1a1a1a",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 4,
              color: "#e5e5e5",
              fontSize: 12,
            }}
          />
          <Area
            type="monotone"
            dataKey="risk"
            stroke="#a3a3a3"
            strokeWidth={1.5}
            fill="url(#riskGradient)"
          />
          <Area
            type="monotone"
            dataKey="fraud"
            stroke="#525252"
            strokeWidth={1.5}
            fill="transparent"
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="mt-2 flex justify-between text-xs text-[#525252]">
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

  const colors = ["#737373", "#525252", "#a3a3a3", "#d4d4d4", "#404040"];

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
              background: "#1a1a1a",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 4,
              color: "#e5e5e5",
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

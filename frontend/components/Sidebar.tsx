import {
  Activity,
  BarChart3,
  Brain,
  FileText,
  Fingerprint,
  Gauge,
  Network,
  PlayCircle,
  Settings,
  Shield,
  Siren,
  Table2,
} from "lucide-react";

const navItems = [
  ["Overview", Shield],
  ["Live Transactions", Activity],
  ["Attack Lab", Siren],
  ["Simulations", PlayCircle],
  ["Risk Engine", Gauge],
  ["Fraud Cases", Table2],
  ["AI Investigator", Brain],
  ["Fraud Network", Network],
  ["Models", Fingerprint],
  ["Reports", FileText],
  ["Settings", Settings],
] as const;

export function Sidebar() {
  return (
    <aside className="sticky top-5 hidden h-[calc(100vh-40px)] w-60 shrink-0 flex-col rounded-lg border border-white/[0.06] bg-[#111] p-4 lg:flex">
      <div className="flex items-center gap-3 border-b border-white/[0.06] pb-4">
        <div className="grid h-9 w-9 place-items-center rounded bg-[#d4d4d4] text-[11px] font-bold text-[#0a0a0a]">
          S
        </div>
        <div>
          <div className="text-sm font-medium text-[#e5e5e5]">Sentra</div>
          <div className="text-xs text-[#737373]">Fraud Defense</div>
        </div>
      </div>

      <nav className="mt-4 grid gap-0.5">
        {navItems.map(([label, Icon], index) => (
          <a
            key={label}
            href="#"
            className={`flex items-center gap-3 rounded px-3 py-2 text-sm transition ${
              index === 0
                ? "bg-white/[0.08] text-[#e5e5e5]"
                : "text-[#a3a3a3] hover:bg-white/[0.04] hover:text-[#e5e5e5]"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </a>
        ))}
      </nav>

      <div className="mt-auto flex items-center gap-2 rounded border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-sm text-[#a3a3a3]">
        <span className="h-2 w-2 rounded-full bg-[#4ade80]" />
        System Operational
      </div>
    </aside>
  );
}

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
    <aside className="sticky top-5 hidden h-[calc(100vh-40px)] w-68 shrink-0 flex-col rounded-xl border border-slate-400/20 bg-[#0d1219]/95 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl lg:flex">
      <div className="flex items-center gap-3 border-b border-white/10 pb-5">
        <div className="grid h-11 w-11 place-items-center rounded-lg bg-cyan-400 font-black text-slate-950 shadow-lg shadow-cyan-500/20">
          A
        </div>
        <div>
          <div className="text-sm font-semibold text-white">AegisPay</div>
          <div className="text-sm text-slate-400">AI Fraud Defense</div>
        </div>
      </div>

      <nav className="mt-5 grid gap-1">
        {navItems.map(([label, Icon], index) => (
          <a
            key={label}
            href="#"
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
              index === 0
                ? "bg-cyan-400/10 text-white ring-1 ring-cyan-300/15"
                : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </a>
        ))}
      </nav>

      <div className="mt-auto flex items-center gap-2 rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.06] px-3 py-3 text-sm text-slate-300">
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(52,211,153,0.85)]" />
        System Operational
      </div>
    </aside>
  );
}

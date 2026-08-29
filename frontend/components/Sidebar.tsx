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
    <aside className="sticky top-5 hidden h-[calc(100vh-40px)] w-60 shrink-0 flex-col rounded-xl border border-white/[0.06] bg-raise p-4 lg:flex">
      <div className="flex items-center gap-3 border-b border-white/[0.06] pb-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Sentra logo" className="h-11 w-11 rounded object-contain" />
        <div className="min-w-0">
          <div className="text-xl font-semibold tracking-[-0.02em] text-ink">Sentra</div>
          <div className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-dim">
            Command Center
          </div>
        </div>
      </div>

      <div className="mt-4 px-1 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-dim">
        Workspace
      </div>

      <nav className="mt-2 grid gap-0.5">
        {navItems.map(([label, Icon], index) => (
          <a
            key={label}
            href="#"
            className={`flex items-center gap-3 rounded-md px-2.5 py-1.5 text-[13px] transition ${
              index === 0
                ? "bg-white/[0.07] font-medium text-ink"
                : "text-mute hover:bg-white/[0.04] hover:text-ink"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </a>
        ))}
      </nav>
    </aside>
  );
}

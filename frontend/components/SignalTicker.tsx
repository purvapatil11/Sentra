import { Activity, RadioTower, ShieldCheck, Zap } from "lucide-react";

const signals = [
  ["Network", "Operational", RadioTower],
  ["Risk engine", "Live", Activity],
  ["Decision latency", "84 ms", Zap],
  ["Policy layer", "Enforced", ShieldCheck],
] as const;

export function SignalTicker() {
  return (
    <div className="signal-ticker" aria-label="Live platform telemetry">
      <div className="signal-ticker-track">
        {[...signals, ...signals].map(([label, value, Icon], index) => (
          <div className="signal-ticker-item" key={`${label}-${index}`}>
            <Icon aria-hidden="true" className="h-3.5 w-3.5" />
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

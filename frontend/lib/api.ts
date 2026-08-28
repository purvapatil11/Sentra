import type {
  AttackFamily,
  Customer,
  DashboardState,
  Feedback,
  FraudCase,
  Scenario,
  SimulationRun,
  Transaction,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_SENTRA_API ?? "http://127.0.0.1:8000";

export function getEventStreamUrl(replay = 30): string {
  return `${API_BASE}/events/stream?replay=${replay}`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Sentra API failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export interface LaunchAttackInput {
  attack_family: AttackFamily;
  volume: number;
  fraud_ratio: number;
  score_all: boolean;
}

export async function generateCustomers(count = 100): Promise<{
  created: number;
  customers: Customer[];
}> {
  return request("/customers/generate", {
    method: "POST",
    body: JSON.stringify({ count }),
  });
}

export async function getCustomers(): Promise<{ customers: Customer[] }> {
  return request("/customers?limit=100");
}

export async function getRuns(): Promise<{ runs: SimulationRun[] }> {
  return request("/simulate/runs?limit=8");
}

export async function launchAttack(input: LaunchAttackInput): Promise<SimulationRun> {
  return request("/simulate/launch", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getTransactions(): Promise<{ transactions: Transaction[] }> {
  return request("/transactions?limit=5000");
}

export async function getCases(): Promise<{ cases: FraudCase[] }> {
  return request("/cases?limit=80");
}

export async function generateFeedback(): Promise<{
  feedback: Feedback;
  next_scenario: Scenario;
}> {
  return request("/feedback", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export async function loadDashboardState(): Promise<DashboardState> {
  const [customers, runs, transactions, cases] = await Promise.all([
    getCustomers().catch(() => ({ customers: [] })),
    getRuns().catch(() => ({ runs: [] })),
    getTransactions().catch(() => ({ transactions: [] })),
    getCases().catch(() => ({ cases: [] })),
  ]);

  return {
    customers: customers.customers,
    runs: runs.runs,
    transactions: transactions.transactions,
    cases: cases.cases,
    feedback: null,
    nextScenario: null,
  };
}

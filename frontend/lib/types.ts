export type AttackFamily =
  | "account_takeover"
  | "ai_social_engineering"
  | "synthetic_identity";

export type Decision = "ALLOW" | "MONITOR" | "VERIFY" | "BLOCK";
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface Customer {
  customer_id: string;
  segment: string;
  home_region: string;
  avg_transaction_amount: number;
  account_age_days: number;
  device_trust_score: number;
}

export interface Transaction {
  transaction_id: string;
  customer_id: string;
  amount: number;
  customer_avg_amount: number;
  amount_ratio: number;
  transaction_hour: number;
  velocity_10m: number;
  velocity_24h: number;
  account_age_days: number;
  beneficiary_age_minutes: number;
  device_trust_score: number;
  geo_distance_km: number;
  is_new_device: 0 | 1;
  is_new_beneficiary: 0 | 1;
  channel: string;
  authentication_method: string;
  authentication_success: 0 | 1;
  attack_type: AttackFamily | null;
  label: 0 | 1;
  score?: FraudCase;
}

export interface RiskFactor {
  feature: string;
  value: unknown;
  reason: string;
}

export interface FraudCase {
  case_id: string;
  transaction_id: string;
  xgboost_score: number;
  fraud_probability: number;
  anomaly_score: number;
  is_anomaly: boolean;
  risk_score: number;
  risk_level: RiskLevel;
  decision: Decision;
  action: string;
  explanation: string;
  top_risk_factors: RiskFactor[];
  model_version: string;
}

export interface Scenario {
  scenario_id: string;
  attack_family: AttackFamily;
  target_profile: string;
  fraud_ratio: number;
  amount_multiplier: number;
  velocity_multiplier: number;
  new_device_probability: number;
  new_beneficiary_probability: number;
  geo_anomaly_probability: number;
  evasion_strength: number;
  attack_round: number;
  mutation_strategy: string;
  objective: string;
  _generation?: {
    source: "llm" | "local_fallback" | "adaptive_engine";
    provider: string;
    model: string;
    response_id: string | null;
    generated_at: string | null;
    fallback_reason: string | null;
  };
}

export interface SimulationRun {
  run_id: string;
  scenario?: Scenario;
  total_transactions: number;
  fraud_transactions: number;
  flagged_cases?: number;
}

export interface Feedback {
  scenario_id: string;
  attack_family: AttackFamily;
  attack_round: number;
  total_transactions: number;
  fraud_transactions: number;
  fraud_detected: number;
  fraud_missed: number;
  detection_rate: number;
  evasion_rate: number;
  false_positive_rate: number;
  average_risk_score: number;
  recommended_mutation: string;
}

export interface SOCEvent {
  id: number;
  timestamp: string;
  source: string;
  level: "info" | "warning" | "error" | string;
  message: string;
  run_id: string | null;
  data: Record<string, unknown>;
}

export interface DashboardState {
  customers: Customer[];
  runs: SimulationRun[];
  transactions: Transaction[];
  cases: FraudCase[];
  feedback: Feedback | null;
  nextScenario: Scenario | null;
}

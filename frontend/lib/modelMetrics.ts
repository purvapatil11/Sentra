import type { Transaction } from "./types";

export interface ModelMetrics {
  truePositives: number;
  falsePositives: number;
  trueNegatives: number;
  falseNegatives: number;
  evaluated: number;
  precision: number | null;
  recall: number | null;
  f1Score: number | null;
  falsePositiveRate: number | null;
}

function safeDivide(numerator: number, denominator: number): number | null {
  return denominator === 0 ? null : numerator / denominator;
}

export function calculateModelMetrics(transactions: Transaction[]): ModelMetrics {
  let truePositives = 0;
  let falsePositives = 0;
  let trueNegatives = 0;
  let falseNegatives = 0;

  for (const transaction of transactions) {
    if (!transaction.score) continue;

    const actualFraud = transaction.label === 1;
    const predictedFraud =
      transaction.score.decision === "VERIFY" || transaction.score.decision === "BLOCK";

    if (actualFraud && predictedFraud) truePositives += 1;
    else if (!actualFraud && predictedFraud) falsePositives += 1;
    else if (!actualFraud && !predictedFraud) trueNegatives += 1;
    else falseNegatives += 1;
  }

  const precision = safeDivide(truePositives, truePositives + falsePositives);
  const recall = safeDivide(truePositives, truePositives + falseNegatives);
  const f1Score =
    precision === null || recall === null || precision + recall === 0
      ? null
      : (2 * precision * recall) / (precision + recall);

  return {
    truePositives,
    falsePositives,
    trueNegatives,
    falseNegatives,
    evaluated: truePositives + falsePositives + trueNegatives + falseNegatives,
    precision,
    recall,
    f1Score,
    falsePositiveRate: safeDivide(falsePositives, falsePositives + trueNegatives),
  };
}

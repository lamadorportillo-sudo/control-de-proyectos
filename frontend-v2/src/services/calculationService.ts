/**
 * Calculation and formatting engine for Control Contractual
 * Rules from DESIGN.md:
 * - Currency format: "L 1,234,567.89"
 * - Tabular numbers and engineering precision
 * - Contractual advance amortization: 100% amortized at 80% progress
 * - ISR 12.5% when applicable
 * - Retención de cumplimiento 15%
 * - Retención de calidad 5%
 * - Visible warning for amounts > L 1,000,000
 */

export function formatLempiras(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'L 0.00';
  }
  return (
    'L ' +
    amount.toLocaleString('es-HN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0.00%';
  }
  return `${value.toFixed(2)}%`;
}

export function formatDateSpanish(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Pendiente de registrar';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      const months = [
        'ene', 'feb', 'mar', 'abr', 'may', 'jun',
        'jul', 'ago', 'sep', 'oct', 'nov', 'dic'
      ];
      return `${day} ${months[month]} ${year}`;
    }
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('es-HN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export interface EstimateCalculationInput {
  grossAmount: number;
  totalContractAmount: number;
  advanceTotalAmount: number;
  previousAmortizedAmount: number;
  cumulativeProgressPercent: number; // 0-100
  applyIsr: boolean; // 12.5%
  applyComplianceRetention: boolean; // 15%
  applyQualityRetention: boolean; // 5%
  otherDeductions: number;
}

export interface EstimateCalculationResult {
  grossAmount: number;
  advanceAmortization: number;
  isrAmount: number;
  complianceRetentionAmount: number;
  qualityRetentionAmount: number;
  otherDeductions: number;
  totalDeductions: number;
  netPayable: number;
  remainingAdvance: number;
  hasLargeAmountAlert: boolean; // > L 1,000,000
}

export function calculateEstimateDeductions(
  input: EstimateCalculationInput
): EstimateCalculationResult {
  const {
    grossAmount,
    totalContractAmount,
    advanceTotalAmount,
    previousAmortizedAmount,
    cumulativeProgressPercent,
    applyIsr,
    applyComplianceRetention,
    applyQualityRetention,
    otherDeductions,
  } = input;

  // Rule from DESIGN.md:
  // "el anticipo es amortizado al 100% al alcanzar el 80% de ejecución financiera/física según contrato."
  // Proportional rate = advanceTotal / (totalContract * 0.80) = (20% advance / 80% threshold = 25% of gross estimate)
  let calculatedAmortization = 0;
  if (advanceTotalAmount > 0 && previousAmortizedAmount < advanceTotalAmount) {
    const unamortizedAdvance = advanceTotalAmount - previousAmortizedAmount;
    if (cumulativeProgressPercent >= 80) {
      // Must be 100% amortized at or beyond 80%
      calculatedAmortization = unamortizedAdvance;
    } else {
      // Standard amortization factor up to 80% threshold
      const amortizationRate = totalContractAmount > 0 ? (advanceTotalAmount / (totalContractAmount * 0.8)) : 0.25;
      const proposed = grossAmount * amortizationRate;
      calculatedAmortization = Math.min(proposed, unamortizedAdvance);
    }
  }

  // Contractual retentions
  const isrAmount = applyIsr ? grossAmount * 0.125 : 0;
  const complianceRetentionAmount = applyComplianceRetention ? grossAmount * 0.15 : 0;
  const qualityRetentionAmount = applyQualityRetention ? grossAmount * 0.05 : 0;

  const totalDeductions =
    calculatedAmortization +
    isrAmount +
    complianceRetentionAmount +
    qualityRetentionAmount +
    (otherDeductions || 0);

  const netPayable = Math.max(0, grossAmount - totalDeductions);
  const remainingAdvance = Math.max(0, advanceTotalAmount - (previousAmortizedAmount + calculatedAmortization));

  return {
    grossAmount,
    advanceAmortization: calculatedAmortization,
    isrAmount,
    complianceRetentionAmount,
    qualityRetentionAmount,
    otherDeductions: otherDeductions || 0,
    totalDeductions,
    netPayable,
    remainingAdvance,
    hasLargeAmountAlert: netPayable >= 1000000 || grossAmount >= 1000000,
  };
}

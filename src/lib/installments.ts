import { formatInstallment, round2 } from "@/lib/format";

export const CARD_MONTHLY_INTEREST = 0.0199;
export const MAX_INSTALLMENTS = 21;
export const NO_INTEREST_INSTALLMENTS = 10;

export function installmentValue(total: number, count: number) {
  if (count <= 0) return total;
  if (count <= NO_INTEREST_INSTALLMENTS) return round2(total / count);
  const rate = CARD_MONTHLY_INTEREST;
  return round2((total * rate) / (1 - Math.pow(1 + rate, -count)));
}

export function installmentTotal(total: number, count: number) {
  return round2(installmentValue(total, count) * count);
}

export function hasInterest(count: number) {
  return count > NO_INTEREST_INSTALLMENTS;
}

export interface InstallmentOption {
  count: number;
  value: number;
  total: number;
  interest: boolean;
}

export function getInstallmentOptions(total: number): InstallmentOption[] {
  return Array.from({ length: MAX_INSTALLMENTS }, (_, index) => {
    const count = index + 1;
    return {
      count,
      value: installmentValue(total, count),
      total: installmentTotal(total, count),
      interest: hasInterest(count),
    };
  });
}

export function installmentLabels(total: number) {
  return {
    noInterest: `até 10x de ${formatInstallment(
      installmentValue(total, NO_INTEREST_INSTALLMENTS),
    )} s/ juros`,
    withInterest: `ou 21x de ${formatInstallment(
      installmentValue(total, MAX_INSTALLMENTS),
    )} c/ juros`,
  };
}

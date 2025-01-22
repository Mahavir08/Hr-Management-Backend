export type CitizenshipStatus = "CITIZEN" | "FOREIGNER";
export type AgeGroup =
  | "BELOW_55"
  | "55_TO_60"
  | "60_TO_65"
  | "65_TO_70"
  | "ABOVE_70";

export interface CPFRates {
  employeeShare: number;
  employerShare: number;
  totalRate: number;
}

export type CPFConfiguration = {
  [K in CitizenshipStatus]: {
    [A in AgeGroup]: CPFRates;
  };
};

export interface SalaryDetails {
  basicSalary: number;
  bonus?: number;
  additionalWages?: number;
}

export interface CPFCalculationResult {
  employeeContribution: number;
  employerContribution: number;
  totalContribution: number;
  grossSalary: number;
  netSalary: number;
}

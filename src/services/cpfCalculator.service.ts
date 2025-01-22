import {
  CitizenshipStatus,
  AgeGroup,
  SalaryDetails,
  CPFCalculationResult,
} from "../types/cpf.types";
import { CPFConfigService } from "./cpfConfig.service";

export class CPFCalculator {
  private static readonly ORDINARY_WAGE_CEILING = 6000;
  private static readonly ADDITIONAL_WAGE_CEILING = 102000;

  constructor(private cpfConfigService: CPFConfigService) {}

  public calculateCPF(
    citizenship: CitizenshipStatus,
    ageGroup: AgeGroup,
    salaryDetails: SalaryDetails
  ): CPFCalculationResult {
    const rates = this.cpfConfigService.getRates(citizenship, ageGroup);
    const { basicSalary, bonus = 0, additionalWages = 0 } = salaryDetails;

    // Calculate CPF for ordinary wages (monthly salary)
    const cappedBasicSalary = Math.min(
      basicSalary,
      CPFCalculator.ORDINARY_WAGE_CEILING
    );
    const ordinaryWagesCPF = cappedBasicSalary * rates.totalRate;

    // Calculate CPF for additional wages
    const cappedAdditionalWages = Math.min(
      additionalWages + bonus,
      CPFCalculator.ADDITIONAL_WAGE_CEILING
    );
    const additionalWagesCPF = cappedAdditionalWages * rates.totalRate;

    const totalCPF = ordinaryWagesCPF + additionalWagesCPF;
    const employeeContribution =
      totalCPF * (rates.employeeShare / rates.totalRate);
    const employerContribution =
      totalCPF * (rates.employerShare / rates.totalRate);

    const grossSalary = basicSalary + bonus + additionalWages;
    const netSalary = grossSalary - employeeContribution;

    return {
      employeeContribution,
      employerContribution,
      totalContribution: totalCPF,
      grossSalary,
      netSalary,
    };
  }
}

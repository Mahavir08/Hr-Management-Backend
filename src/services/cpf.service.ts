import {
  CitizenshipStatus,
  AgeGroup,
  SalaryDetails,
  CPFCalculationResult,
} from "../types/cpf.types";
import { CPFModel } from "../models/cpf.model";

export class CPFService {
  private static readonly ORDINARY_WAGE_CEILING = 6000;
  private static readonly ADDITIONAL_WAGE_CEILING = 102000;

  constructor(private cpfModel: CPFModel) {}

  public calculateCPF(
    citizenship: CitizenshipStatus,
    ageGroup: AgeGroup,
    salaryDetails: SalaryDetails
  ): CPFCalculationResult {
    const rates = this.cpfModel.getRates(citizenship, ageGroup);
    console.log("rates", rates);
    const { basicSalary, bonus = 0, additionalWages = 0 } = salaryDetails;

    // Calculate CPF for ordinary wages (monthly salary)
    const cappedBasicSalary = Math.min(
      basicSalary,
      CPFService.ORDINARY_WAGE_CEILING
    );
    const ordinaryWagesCPF = cappedBasicSalary * rates.totalRate;

    // Calculate CPF for additional wages
    const cappedAdditionalWages = Math.min(
      additionalWages + bonus,
      CPFService.ADDITIONAL_WAGE_CEILING
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

  public updateRates(
    citizenship: CitizenshipStatus,
    ageGroup: AgeGroup,
    employeeShare: number,
    employerShare: number
  ): void {
    this.cpfModel.updateRates(
      citizenship,
      ageGroup,
      employeeShare,
      employerShare
    );
  }
}

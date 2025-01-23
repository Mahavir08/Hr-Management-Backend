import {
  CitizenshipStatus,
  AgeGroup,
  SalaryDetails,
  CPFCalculationResult,
} from "../types/cpf.types";
import { CPFModel } from "../models/cpf.model";
import { CPFRecord, ICPFRecord } from "../models/cpfRecord.schema";

export class CPFService {
  private static readonly ORDINARY_WAGE_CEILING = 6000;
  private static readonly ADDITIONAL_WAGE_CEILING = 102000;

  constructor(private cpfModel: CPFModel) {}

  public async calculateAndSaveCPF(
    employeeId: string,
    citizenship: CitizenshipStatus,
    ageGroup: AgeGroup,
    salaryDetails: SalaryDetails
  ): Promise<ICPFRecord> {
    const calculations = this.calculateCPF(
      citizenship,
      ageGroup,
      salaryDetails
    );

    const cpfRecord = new CPFRecord({
      employeeId,
      citizenship,
      ageGroup,
      salaryDetails,
      calculations,
    });

    return await cpfRecord.save();
  }

  public async getCPFHistory(
    employeeId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<ICPFRecord[]> {
    const query: any = { employeeId };

    if (startDate || endDate) {
      query.calculatedAt = {};
      if (startDate) query.calculatedAt.$gte = startDate;
      if (endDate) query.calculatedAt.$lte = endDate;
    }

    return await CPFRecord.find(query).sort({ calculatedAt: -1 }).exec();
  }

  public async getAllCPF(): Promise<ICPFRecord[]> {
    try {
      return await CPFRecord.find({});
    } catch (error) {
      return [];
    }
  }

  public calculateCPF(
    citizenship: CitizenshipStatus,
    ageGroup: AgeGroup,
    salaryDetails: SalaryDetails
  ): CPFCalculationResult {
    const rates = this.cpfModel.getRates(citizenship, ageGroup);

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
      citizenship === "FOREIGNER"
        ? 0
        : totalCPF * (rates.employeeShare / rates.totalRate);

    const employerContribution =
      citizenship === "FOREIGNER"
        ? 0
        : totalCPF * (rates.employerShare / rates.totalRate);

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

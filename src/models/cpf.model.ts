import {
  CPFConfiguration,
  CitizenshipStatus,
  AgeGroup,
  CPFRates,
} from "../types/cpf.types";

export class CPFModel {
  private static instance: CPFModel;
  private cpfRates: CPFConfiguration;

  private constructor() {
    this.cpfRates = this.getDefaultRates();
  }

  public static getInstance(): CPFModel {
    if (!CPFModel.instance) {
      CPFModel.instance = new CPFModel();
    }
    return CPFModel.instance;
  }

  private getDefaultRates(): CPFConfiguration {
    return {
      CITIZEN: {
        BELOW_55: { employeeShare: 0.2, employerShare: 0.17, totalRate: 0.37 },
        "55_TO_60": {
          employeeShare: 0.17,
          employerShare: 0.155,
          totalRate: 0.325,
        },
        "60_TO_65": {
          employeeShare: 0.115,
          employerShare: 0.12,
          totalRate: 0.235,
        },
        "65_TO_70": {
          employeeShare: 0.075,
          employerShare: 0.09,
          totalRate: 0.165,
        },
        ABOVE_70: {
          employeeShare: 0.05,
          employerShare: 0.075,
          totalRate: 0.125,
        },
      },
      FOREIGNER: {
        BELOW_55: { employeeShare: 0, employerShare: 0, totalRate: 0 },
        "55_TO_60": { employeeShare: 0, employerShare: 0, totalRate: 0 },
        "60_TO_65": { employeeShare: 0, employerShare: 0, totalRate: 0 },
        "65_TO_70": { employeeShare: 0, employerShare: 0, totalRate: 0 },
        ABOVE_70: { employeeShare: 0, employerShare: 0, totalRate: 0 },
      },
    };
  }

  public getRates(
    citizenship: CitizenshipStatus,
    ageGroup: AgeGroup
  ): CPFRates {
    return this.cpfRates[citizenship][ageGroup];
  }

  public updateRates(
    citizenship: CitizenshipStatus,
    ageGroup: AgeGroup,
    employeeShare: number,
    employerShare: number
  ): void {
    this.cpfRates[citizenship][ageGroup] = {
      employeeShare,
      employerShare,
      totalRate: employeeShare + employerShare,
    };
  }
}

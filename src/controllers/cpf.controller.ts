import { Request, Response } from "express";
import { CPFService } from "../services/cpf.service";
import { CPFModel } from "../models/cpf.model";
import {
  CitizenshipStatus,
  AgeGroup,
  SalaryDetails,
  CPFCalculationResult,
} from "../types/cpf.types";
import { CPFRecord } from "../models/cpfRecord.schema";

interface EmployeeCPFRequest {
  employeeId: string;
  citizenship: CitizenshipStatus;
  ageGroup: AgeGroup;
  salaryDetails: SalaryDetails;
}

interface BulkCPFResponse {
  employeeId: string;
  calculations?: CPFCalculationResult;
  error?: string;
}

export class CPFController {
  private cpfService: CPFService;
  private readonly MAX_BATCH_SIZE = 1000;
  private readonly MIN_BATCH_SIZE = 1;

  constructor() {
    const cpfModel = CPFModel.getInstance();
    this.cpfService = new CPFService(cpfModel);
  }

  public calculateCPF = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId, citizenship, ageGroup, salaryDetails } = req.body;

      // Validate required fields
      if (!employeeId || !citizenship || !ageGroup || !salaryDetails) {
        throw new Error("Missing required fields");
      }

      // Validate citizenship
      if (!["CITIZEN", "FOREIGNER"].includes(citizenship)) {
        throw new Error("Invalid citizenship status");
      }

      // Validate age group
      if (
        !["BELOW_55", "55_TO_60", "60_TO_65", "65_TO_70", "ABOVE_70"].includes(
          ageGroup
        )
      ) {
        throw new Error("Invalid age group");
      }

      if (
        typeof salaryDetails.basicSalary !== "number" ||
        salaryDetails.basicSalary < 0 ||
        !salaryDetails.basicSalary
      ) {
        throw new Error("Invalid basic salary");
      }

      if (
        (salaryDetails.bonus && typeof salaryDetails.bonus !== "number") ||
        salaryDetails.bonus < 0
      ) {
        throw new Error("Invalid bonus amount");
      }

      if (
        (salaryDetails.additionalWages &&
          typeof salaryDetails.additionalWages !== "number") ||
        salaryDetails.additionalWages < 0
      ) {
        throw new Error("Invalid additional wages");
      }

      const result = await this.cpfService.calculateAndSaveCPF(
        employeeId,
        citizenship,
        ageGroup,
        salaryDetails
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || "Invalid input parameters",
      });
    }
  };

  public calculateBulkCPF = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const employees: EmployeeCPFRequest[] = req.body.employees;

      // Validate batch size
      if (!Array.isArray(employees)) {
        throw new Error("Invalid input: employees must be an array");
      }

      if (
        employees.length < this.MIN_BATCH_SIZE ||
        employees.length > this.MAX_BATCH_SIZE
      ) {
        throw new Error(
          `Batch size must be between ${this.MIN_BATCH_SIZE} and ${this.MAX_BATCH_SIZE}`
        );
      }

      // Validate each employee record
      employees.forEach((employee, index) => {
        if (
          !employee.employeeId ||
          !employee.citizenship ||
          !employee.ageGroup ||
          !employee.salaryDetails
        ) {
          throw new Error(
            `Missing required fields for employee at index ${index}`
          );
        }

        if (!["CITIZEN", "FOREIGNER"].includes(employee.citizenship)) {
          throw new Error(
            `Invalid citizenship status for employee ${employee.employeeId}`
          );
        }

        if (
          ![
            "BELOW_55",
            "55_TO_60",
            "60_TO_65",
            "65_TO_70",
            "ABOVE_70",
          ].includes(employee.ageGroup)
        ) {
          throw new Error(
            `Invalid age group for employee ${employee.employeeId}`
          );
        }

        if (
          typeof employee.salaryDetails.basicSalary !== "number" ||
          employee.salaryDetails.basicSalary < 0
        ) {
          throw new Error(
            `Invalid basic salary for employee ${employee.employeeId}`
          );
        }

        if (
          employee.salaryDetails.bonus &&
          (typeof employee.salaryDetails.bonus !== "number" ||
            employee.salaryDetails.bonus < 0)
        ) {
          throw new Error(
            `Invalid bonus amount for employee ${employee.employeeId}`
          );
        }

        if (
          employee.salaryDetails.additionalWages &&
          (typeof employee.salaryDetails.additionalWages !== "number" ||
            employee.salaryDetails.additionalWages < 0)
        ) {
          throw new Error(
            `Invalid additional wages for employee ${employee.employeeId}`
          );
        }
      });

      // Process and save employees in parallel
      const results = await Promise.all(
        employees.map((employee) =>
          this.cpfService
            .calculateAndSaveCPF(
              employee.employeeId,
              employee.citizenship,
              employee.ageGroup,
              employee.salaryDetails
            )
            .catch((error) => ({
              employeeId: employee.employeeId,
              error:
                error.message || "Failed to calculate CPF for this employee",
            }))
        )
      );

      const successfulCalculations = results.filter(
        (result) => !("error" in result)
      );
      const failedCalculations = results.filter((result) => "error" in result);

      res.status(200).json({
        success: true,
        summary: {
          totalProcessed: employees.length,
          successfulCalculations: successfulCalculations.length,
          failedCalculations: failedCalculations.length,
        },
        data: successfulCalculations,
        errors: failedCalculations,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || "Invalid input parameters",
      });
    }
  };

  public getCPFHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId } = req.params;
      const { startDate, endDate } = req.query;

      // Validate employee ID
      if (!employeeId) {
        throw new Error("Employee ID is required");
      }

      // Validate dates if provided
      if (startDate && isNaN(Date.parse(startDate as string))) {
        throw new Error("Invalid start date format");
      }

      if (endDate && isNaN(Date.parse(endDate as string))) {
        throw new Error("Invalid end date format");
      }

      if (
        startDate &&
        endDate &&
        new Date(startDate as string) > new Date(endDate as string)
      ) {
        throw new Error("Start date cannot be later than end date");
      }

      const history = await this.cpfService.getCPFHistory(
        employeeId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      if (history.length === 0) throw new Error("No Record Found");

      res.status(200).json({
        success: true,
        data: history,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error?.message || "Failed to retrieve CPF history",
      });
    }
  };

  public getAllCPF = async (req: Request, res: Response): Promise<void> => {
    try {
      const history = await this.cpfService.getAllCPF();

      if (!history) {
        throw new Error("Failed to retrieve CPF records");
      }

      res.status(200).json({
        success: true,
        data: history,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || "Failed to retrieve CPF history",
      });
    }
  };

  public updateRates = async (req: Request, res: Response): Promise<void> => {
    try {
      const { citizenship, ageGroup, employeeShare, employerShare } = req.body;

      // Validate required fields
      if (
        !citizenship ||
        !ageGroup ||
        employeeShare === undefined ||
        employerShare === undefined
      ) {
        throw new Error("Missing required fields");
      }

      // Validate citizenship
      if (!["CITIZEN", "FOREIGNER"].includes(citizenship)) {
        throw new Error("Invalid citizenship status");
      }

      // Validate age group
      if (
        !["BELOW_55", "55_TO_60", "60_TO_65", "65_TO_70", "ABOVE_70"].includes(
          ageGroup
        )
      ) {
        throw new Error("Invalid age group");
      }

      // Validate contribution rates
      if (
        typeof employeeShare !== "number" ||
        employeeShare < 0 ||
        employeeShare > 1
      ) {
        throw new Error("Employee share must be a number between 0 and 1");
      }

      if (
        typeof employerShare !== "number" ||
        employerShare < 0 ||
        employerShare > 1
      ) {
        throw new Error("Employer share must be a number between 0 and 1");
      }

      this.cpfService.updateRates(
        citizenship,
        ageGroup,
        employeeShare,
        employerShare
      );

      res.status(200).json({
        success: true,
        message: "CPF rates updated successfully",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || "Invalid input parameters",
      });
    }
  };
}

import { Request, Response } from "express";
import { CPFService } from "../services/cpf.service";
import { CPFModel } from "../models/cpf.model";

export class CPFController {
  private cpfService: CPFService;

  constructor() {
    const cpfModel = CPFModel.getInstance();
    this.cpfService = new CPFService(cpfModel);
  }

  public calculateCPF = async (req: Request, res: Response): Promise<void> => {
    try {
      const { citizenship, ageGroup, salaryDetails } = req.body;

      const result = this.cpfService.calculateCPF(
        citizenship,
        ageGroup,
        salaryDetails
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: "Invalid input parameters",
      });
    }
  };

  public updateRates = async (req: Request, res: Response): Promise<void> => {
    try {
      const { citizenship, ageGroup, employeeShare, employerShare } = req.body;

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
    } catch (error) {
      res.status(400).json({
        success: false,
        error: "Invalid input parameters",
      });
    }
  };
}

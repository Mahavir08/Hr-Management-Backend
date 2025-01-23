import { Router } from "express";
import { CPFController } from "../controllers/cpf.controller";

const router = Router();
const cpfController = new CPFController();

// Single employee CPF calculation
// Single employee CPF calculation
// POST /api/cpf/calculate
// Body: {
//   "employeeId": "string",
//   "citizenship": "CITIZEN" | "FOREIGNER",
//   "ageGroup": "BELOW_55" | "55_TO_60" | "60_TO_65" | "65_TO_70" | "ABOVE_70",
//   "salaryDetails": {
//     "basicSalary": number,
//     "bonus": number,
//     "additionalWages": number
//   }
// }
router.post("/calculate", cpfController.calculateCPF);

// Bulk CPF calculation for multiple employees
// POST /api/cpf/calculate-bulk
// Body: {
//   "employees": [{
//     "employeeId": "string",
//     "citizenship": "CITIZEN" | "FOREIGNER",
//     "ageGroup": "BELOW_55" | "55_TO_60" | "60_TO_65" | "65_TO_70" | "ABOVE_70",
//     "salaryDetails": {
//       "basicSalary": number,
//       "bonus": number,
//       "additionalWages": number
//     }
//   }]
// }
router.post("/calculate-bulk", cpfController.calculateBulkCPF);

// Get CPF history for an employee
// GET /api/cpf/history/:employeeId
// Example: /api/cpf/history/EMP123
router.get("/history/:employeeId", cpfController.getCPFHistory);

// Get CPF history for an employee
// GET /api/cpf/history/allCPF
// Example: /api/cpf/history/allCPF
router.get("/allCPF", cpfController.getAllCPF);

// Update CPF rates
router.post("/update-rates", cpfController.updateRates);

export default router;

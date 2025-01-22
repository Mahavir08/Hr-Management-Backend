import { Router } from "express";
import { CPFController } from "../controllers/cpf.controller";

const router = Router();
const cpfController = new CPFController();

router.post("/calculate", cpfController.calculateCPF);
router.post("/update-rates", cpfController.updateRates);

export default router;

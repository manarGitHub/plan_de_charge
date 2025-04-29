import express from "express";
import { calculateAndSaveProductionRates, getAllMonthlyRates } from "../controllers/productionRateController";

const router = express.Router();

router.post("/", calculateAndSaveProductionRates);
router.get("/", getAllMonthlyRates);


export default router;

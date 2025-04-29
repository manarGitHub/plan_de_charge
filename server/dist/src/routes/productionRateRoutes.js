"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const productionRateController_1 = require("../controllers/productionRateController");
const router = express_1.default.Router();
router.post("/", productionRateController_1.calculateAndSaveProductionRates);
router.get("/", productionRateController_1.getAllMonthlyRates);
exports.default = router;

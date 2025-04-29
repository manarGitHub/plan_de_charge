"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const devisController_1 = require("../controllers/devisController");
const router = (0, express_1.Router)();
router.post('/', devisController_1.createEmptyDevis);
router.get('/', devisController_1.getAllDevis);
router.get("/:id", devisController_1.getDevisById);
router.put('/:id', devisController_1.updateDevis); // Update Devis and assign users
router.delete('/:id', devisController_1.deleteDevis);
exports.default = router;

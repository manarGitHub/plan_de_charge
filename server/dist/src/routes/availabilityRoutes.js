"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const availabilityController_1 = require("../controllers/availabilityController");
const router = express_1.default.Router();
// Get all availabilities for a specific user
router.get('/:userId', availabilityController_1.getAllAvailabilities);
router.get('/', availabilityController_1.getAllAvailabilitiesWithUser);
// Create a new availability for a user
router.post('/', availabilityController_1.createAvailability);
// Update availability for a user
router.put('/:id', availabilityController_1.updateAvailability);
// Delete availability for a user
router.delete('/:id', availabilityController_1.deleteAvailability);
exports.default = router;

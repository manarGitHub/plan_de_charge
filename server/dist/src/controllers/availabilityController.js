"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAvailability = exports.updateAvailability = exports.createAvailability = exports.getAllAvailabilitiesWithUser = exports.getAllAvailabilities = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Get all availabilities for a specific user
const getAllAvailabilities = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = parseInt(req.params.userId); // Get userId from params
    try {
        const availabilities = yield prisma.availability.findMany({
            where: {
                userId: userId,
            },
        });
        res.json(availabilities);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch availabilities" });
    }
});
exports.getAllAvailabilities = getAllAvailabilities;
// Controller to get all availabilities with the associated user (username)
const getAllAvailabilitiesWithUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const availabilities = yield prisma.availability.findMany({
            include: {
                user: {
                    select: {
                        username: true, // Include the username field from the User model
                    }
                }
            }
        });
        res.json(availabilities);
    }
    catch (error) {
        console.error("Error fetching availabilities: ", error);
        res.status(500).json({ error: 'An error occurred while fetching availabilities' });
    }
});
exports.getAllAvailabilitiesWithUser = getAllAvailabilitiesWithUser;
// Create a new availability for a user
const createAvailability = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, weekStart, daysAvailable } = req.body;
    try {
        const newAvailability = yield prisma.availability.create({
            data: {
                userId,
                weekStart: new Date(weekStart),
                daysAvailable,
            },
        });
        res.status(201).json(newAvailability);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to create availability" });
    }
});
exports.createAvailability = createAvailability;
// Update availability by id
const updateAvailability = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id); // Get the availability id from the route
    const { daysAvailable } = req.body;
    try {
        const updatedAvailability = yield prisma.availability.update({
            where: {
                id: id,
            },
            data: {
                daysAvailable,
            },
        });
        res.json(updatedAvailability);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to update availability" });
    }
});
exports.updateAvailability = updateAvailability;
// Delete availability for a user (based on userId and weekStart)
const deleteAvailability = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const deletedAvailability = yield prisma.availability.delete({
            where: {
                id: parseInt(id),
            },
        });
        res.json(deletedAvailability);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to delete availability" });
    }
});
exports.deleteAvailability = deleteAvailability;

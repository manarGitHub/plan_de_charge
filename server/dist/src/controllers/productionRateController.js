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
exports.getAllMonthlyRates = exports.calculateAndSaveProductionRates = void 0;
const client_1 = require("@prisma/client");
const date_fns_1 = require("date-fns");
const prisma = new client_1.PrismaClient();
const calculateAndSaveProductionRates = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const year = parseInt(req.body.year) || new Date().getFullYear();
        const users = yield prisma.user.findMany();
        const results = [];
        for (let month = 0; month < 12; month++) {
            const start = (0, date_fns_1.startOfMonth)(new Date(year, month));
            const end = (0, date_fns_1.endOfMonth)(start);
            const monthKey = `${start.getFullYear()}-${String(month + 1).padStart(2, "0")}`;
            for (const user of users) {
                const availability = yield prisma.availability.findFirst({
                    where: {
                        userId: user.userId,
                        weekStart: { gte: start, lte: end },
                    },
                });
                const availableDays = (_a = availability === null || availability === void 0 ? void 0 : availability.daysAvailable) !== null && _a !== void 0 ? _a : 0;
                const tasks = yield prisma.task.findMany({
                    where: {
                        assignedUserId: user.userId,
                        startDate: { gte: start, lte: end },
                    },
                    select: { workingDays: true },
                });
                const workingDays = tasks.reduce((sum, task) => { var _a; return sum + ((_a = task.workingDays) !== null && _a !== void 0 ? _a : 0); }, 0);
                const productionRate = availableDays > 0 ? workingDays / availableDays : 0;
                const saved = yield prisma.monthlyProductionRate.upsert({
                    where: {
                        userId_month: {
                            userId: user.userId,
                            month: monthKey,
                        },
                    },
                    update: {
                        availableDays,
                        workingDays,
                        productionRate,
                    },
                    create: {
                        userId: user.userId,
                        month: monthKey,
                        availableDays,
                        workingDays,
                        productionRate,
                    },
                });
                results.push(saved);
            }
        }
        res.status(201).json(results);
    }
    catch (err) {
        console.error("Error in POST /production-rates", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.calculateAndSaveProductionRates = calculateAndSaveProductionRates;
// Ajoute cette fonction dans le même fichier
const getAllMonthlyRates = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const rates = yield prisma.monthlyProductionRate.findMany({
            include: {
                user: {
                    select: { userId: true, username: true, profile: true } // adapte selon ton modèle User
                }
            },
            orderBy: [
                { month: "desc" },
                { userId: "asc" }
            ]
        });
        res.json(rates);
    }
    catch (error) {
        console.error("Error fetching monthly production rates", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.getAllMonthlyRates = getAllMonthlyRates;

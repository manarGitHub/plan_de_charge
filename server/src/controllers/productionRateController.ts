import { PrismaClient } from "@prisma/client";
import { startOfMonth, endOfMonth } from "date-fns";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const calculateAndSaveProductionRates = async (req: Request, res: Response): Promise<void> => {
  try {
    const year = parseInt(req.body.year) || new Date().getFullYear();
    const users = await prisma.user.findMany();

    const results = [];

    for (let month = 0; month < 12; month++) {
      const start = startOfMonth(new Date(year, month));
      const end = endOfMonth(start);
      const monthKey = `${start.getFullYear()}-${String(month + 1).padStart(2, "0")}`;

      for (const user of users) {
        const availability = await prisma.availability.findFirst({
          where: {
            userId: user.userId,
            weekStart: { gte: start, lte: end },
          },
        });

        const availableDays = availability?.daysAvailable ?? 0;

        const tasks = await prisma.task.findMany({
          where: {
            assignedUserId: user.userId,
            startDate: { gte: start, lte: end },
          },
          select: { workingDays: true },
        });

        const workingDays = tasks.reduce((sum, task) => sum + (task.workingDays ?? 0), 0);

        const productionRate = availableDays > 0 ? workingDays / availableDays : 0;

        const saved = await prisma.monthlyProductionRate.upsert({
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
  } catch (err) {
    console.error("Error in POST /production-rates", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// Ajoute cette fonction dans le même fichier

export const getAllMonthlyRates = async (req: Request, res: Response) => {
  try {
    const rates = await prisma.monthlyProductionRate.findMany({
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
  } catch (error) {
    console.error("Error fetching monthly production rates", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

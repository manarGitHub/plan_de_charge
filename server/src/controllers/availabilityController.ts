import { Request, Response } from 'express';
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Get all availabilities for a specific user
export const getAllAvailabilities = async (req: Request, res: Response) : Promise<void> => {
  const userId = parseInt(req.params.userId);  // Get userId from params
  
  try {
    const availabilities = await prisma.availability.findMany({
      where: {
        userId: userId,
      },
    });
     res.json(availabilities);
  } catch (error) {
    console.error(error);
     res.status(500).json({ message: "Failed to fetch availabilities" });
  }
};

// Controller to get all availabilities with the associated user (username)
export const getAllAvailabilitiesWithUser = async (req: Request, res: Response) : Promise<void> => {
    try {
      const availabilities = await prisma.availability.findMany({
        include: {
          user: {
            select: {
              username: true, // Include the username field from the User model
            }
          }
        }
      });
       res.json(availabilities);
    } catch (error) {
      console.error("Error fetching availabilities: ", error);
       res.status(500).json({ error: 'An error occurred while fetching availabilities' });
    }
  };

// Create a new availability for a user
export const createAvailability = async (req: Request, res: Response) : Promise<void> => {
  const { userId, weekStart, daysAvailable } = req.body;

  try {
    const newAvailability = await prisma.availability.create({
      data: {
        userId,
        weekStart: new Date(weekStart),
        daysAvailable,
      },
    });
     res.status(201).json(newAvailability);
  } catch (error) {
    console.error(error);
     res.status(500).json({ message: "Failed to create availability" });
  }
};

// Update availability by id
export const updateAvailability = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id); // Get the availability id from the route
  const { daysAvailable } = req.body;

  try {
    const updatedAvailability = await prisma.availability.update({
      where: {
        id: id,
      },
      data: {
        daysAvailable,
      },
    });
    res.json(updatedAvailability);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update availability" });
  }
};


// Delete availability for a user (based on userId and weekStart)
export const deleteAvailability = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const deletedAvailability = await prisma.availability.delete({
      where: {
        id: parseInt(id),
      },
    });
    res.json(deletedAvailability);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete availability" });
  }
};

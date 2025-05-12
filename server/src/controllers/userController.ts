import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving users: ${error.message}` });
  }
};
export const getUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cognitoId } = req.params;
    const user = await prisma.user.findUnique({
      where: { cognitoId },
    });

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "user not found" });
    }
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving user: ${error.message}` });
  }
};

export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { 
      cognitoId,
      username,
      email,
      phoneNumber,
      profilePictureUrl,
      teamId,} = req.body;

    const user = await prisma.user.create({
      data: {
        cognitoId,
        username,
        email,
        phoneNumber,
        profilePictureUrl: profilePictureUrl || 'i1.jpg',
        teamId: teamId ? Number(teamId) : null,
      },
    });

    res.status(201).json(user);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error creating user: ${error.message}` });
  }
};
export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cognitoId } = req.params;
    const { username, email, phoneNumber,profile,profilePictureUrl,teamId } = req.body;

    const updateUser = await prisma.user.update({
      where: { cognitoId },
      data: {
        username,
        email,
        phoneNumber,
        profile,
        profilePictureUrl,
        teamId
      },
    });

    res.json(updateUser);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error updating user: ${error.message}` });
  }
};
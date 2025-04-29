import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getTasks = async (req: Request, res: Response): Promise<void> => {
  const { projectId } = req.query;
  try {
    const tasks = await prisma.task.findMany({
      where: {
        projectId: Number(projectId),
      },
      include: {
        author: true,
        assignee: true,
        comments: true,
        attachments: true,
        devis:true,
      },
    });
    res.json(tasks);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving tasks: ${error.message}` });
  }
};

export const createTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  const {
    title,
    description,
    status,
    priority,
    tags,
    startDate,
    dueDate,
    workingDays,
    projectId,
    authorUserId,
    assignedUserId,
    devisId,
  } = req.body;

  try {
    const data: any = {
      title,
      projectId,
    };

    if (description) data.description = description;
    if (status) data.status = status;
    if (priority) data.priority = priority;
    if (tags) data.tags = tags;
    if (workingDays !== undefined && workingDays !== null) data.workingDays = workingDays;
    if (startDate) data.startDate = new Date(startDate);
    if (dueDate) data.dueDate = new Date(dueDate);
    if (authorUserId) data.authorUserId = authorUserId;
    if (assignedUserId) data.assignedUserId = assignedUserId;
    if (devisId) data.devisId = devisId;

    const newTask = await prisma.task.create({ data });

    res.status(201).json(newTask);
  } catch (error: any) {
    console.error("Task creation error:", error);
    res
      .status(500)
      .json({ message: `Error creating a task: ${error.message}` });
  }
};

export const updateTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { taskId } = req.params;
  const {
    title,
    description,
    status,
    priority,
    tags,
    workingDays,
    startDate,
    dueDate,
    assignedUserId,
    devisId,
  } = req.body;

  try {
    // Prepare the update data
    const data: any = {};

    if (title) data.title = title;
    if (description) data.description = description;
    if (status) data.status = status;
    if (priority) data.priority = priority;
    if (tags) data.tags = tags;
    if (workingDays !== undefined && workingDays !== null) data.workingDays = workingDays;
    if (startDate) data.startDate = new Date(startDate);
    if (dueDate) data.dueDate = new Date(dueDate);
    if (assignedUserId) data.assignedUserId = assignedUserId;
    if (devisId) data.devisId = devisId;

    // Update the task in the database
    const updatedTask = await prisma.task.update({
      where: {
        id: Number(taskId),
      },
      data,
    });

    // Send the updated task back in the response
    res.json(updatedTask);
  } catch (error: any) {
    console.error("Task update error:", error);
    res.status(500).json({ message: `Error updating task: ${error.message}` });
  }
};


export const updateTaskStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { taskId } = req.params;
  const { status } = req.body;
  try {
    const updatedTask = await prisma.task.update({
      where: {
        id: Number(taskId),
      },
      data: {
        status: status,
      },
    });
    res.json(updatedTask);
  } catch (error: any) {
    res.status(500).json({ message: `Error updating task: ${error.message}` });
  }
};

export const getUserTasks = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId } = req.params;
  try {
    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { authorUserId: Number(userId) },
          { assignedUserId: Number(userId) },
        ],
      },
      include: {
        author: true,
        assignee: true,
      },
    });
    res.json(tasks);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving user's tasks: ${error.message}` });
  }
};

export const deleteTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { taskId } = req.params;

  try {
    // Delete the task from the database
    const deletedTask = await prisma.task.delete({
      where: {
        id: Number(taskId),
      },
    });

    // Send the deleted task data (or just a success message)
    res.json({ message: `Task with ID ${taskId} deleted successfully`, task: deletedTask });
  } catch (error: any) {
    console.error("Task deletion error:", error);
    res.status(500).json({ message: `Error deleting task: ${error.message}` });
  }
};
